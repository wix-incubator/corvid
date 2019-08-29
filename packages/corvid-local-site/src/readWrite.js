const fs = require("fs-extra");
const path = require("path").posix;

const map_ = require("lodash/map");

const { readDirToJson } = require("corvid-dir-as-json");

const { deleteEmptySubFolders } = require("./utils/fileUtils");

const {
  isPathOfCodeFile,
  isPathOfDocumentFile,
  isPathOfPageFile,
  pageCodeFilePath,
  pageRootFolderPath,
  ROOT_PATHS
} = require("./sitePaths");

const {
  editorDocumentToLocalDocumentFiles,
  localDocumentFilesToEditorDocument,
  editorCodeFilesToLocalCodeFiles,
  localCodeFilesToEditorCodeFiles,
  editorCodePathToLocalCodePath,
  updateLocalPageFilePath
} = require("./siteConverter");

const { TS_CONFIG_NAME, getTypescriptConfigFile } = require("./codeCompletion");

const listFilesRecursive = async siteRootPath =>
  Object.keys(
    await readDirToJson(siteRootPath, {
      delimiter: "/",
      readFiles: false,
      onlyFiles: true
    })
  );

const listLocalDocumentFiles = async siteRootPath => {
  const allFilePaths = await listFilesRecursive(siteRootPath);
  return allFilePaths.filter(filePath => isPathOfDocumentFile(filePath));
};

const listLocalCodeFiles = async siteRootPath => {
  const allFilePaths = await listFilesRecursive(siteRootPath);
  return allFilePaths.filter(filePath => isPathOfCodeFile(filePath));
};

const listLocalPageFiles = async siteRootPath => {
  const allFilePaths = await listFilesRecursive(siteRootPath);
  return allFilePaths.filter(filePath => isPathOfPageFile(filePath));
};

const readLocalFiles = async (siteRootPath, filePaths) => {
  const filesWithContent = await Promise.all(
    filePaths.map(async filePath => {
      const content = await fs.readFile(
        path.join(siteRootPath, filePath),
        "utf8"
      );
      return { path: filePath, content };
    })
  );
  return filesWithContent;
};

const readLocalDocumentFiles = async siteRootPath => {
  const localDocumentFilePaths = await listLocalDocumentFiles(siteRootPath);
  return readLocalFiles(siteRootPath, localDocumentFilePaths);
};

const readLocalCodeFiles = async siteRootPath => {
  const localCodeFilePaths = await listLocalCodeFiles(siteRootPath);
  return readLocalFiles(siteRootPath, localCodeFilePaths);
};

const readWrite = (siteRootPath, filesWatcher) => {
  const ensureLocalFolderSkeleton = () =>
    Promise.all(
      map_(ROOT_PATHS, (dirOrFilePath, rootName) =>
        rootName.endsWith("_FILE")
          ? fs.ensureFile(path.join(siteRootPath, dirOrFilePath))
          : fs.ensureDir(path.join(siteRootPath, dirOrFilePath))
      )
    );

  const createTsConfigIfNotExist = async configRoot => {
    const tsConfigFile = getTypescriptConfigFile(configRoot);
    if (await fs.exists(path.join(siteRootPath, tsConfigFile.path))) {
      return Promise.resolve();
    }
    return filesWatcher.ignoredWriteFile(
      tsConfigFile.path,
      tsConfigFile.content
    );
  };

  const createRootCodeFoldersTsConfigsIfNotExist = async () =>
    Promise.all(
      [ROOT_PATHS.BACKEND, ROOT_PATHS.PUBLIC, ROOT_PATHS.SITE_CODE].map(
        configRoot => createTsConfigIfNotExist(configRoot)
      )
    );

  const createPageFoldersTsConfigsIfNotExist = async newSiteDocumentPages =>
    Promise.all(
      map_(newSiteDocumentPages, async page =>
        createTsConfigIfNotExist(pageRootFolderPath(page))
      )
    );

  const syncExistingPageFolders = async newSiteDocumentPages => {
    const existingPageFilePaths = await listLocalPageFiles(siteRootPath);
    const updatedPageFilePaths = existingPageFilePaths.map(existingPath => ({
      source: existingPath,
      target: updateLocalPageFilePath(existingPath, newSiteDocumentPages)
    }));

    await Promise.all(
      updatedPageFilePaths.map(({ source, target }) =>
        target === null
          ? filesWatcher.ignoredDeleteFile(source)
          : target !== source
          ? filesWatcher.ignoredMoveFile(source, target)
          : Promise.resolve()
      )
    );

    await map_(newSiteDocumentPages, page =>
      filesWatcher.ignoredEnsureFile(pageCodeFilePath(page))
    );

    // todo:: make sure that we delete the tsconmfig when a page has been removed
    await deleteEmptySubFolders(path.join(siteRootPath, ROOT_PATHS.PAGES), [
      TS_CONFIG_NAME
    ]);
    await deleteEmptySubFolders(
      path.join(siteRootPath, ROOT_PATHS.LIGHTBOXES),
      [TS_CONFIG_NAME]
    );
  };

  const updateSiteDocument = async newEditorDocument => {
    await ensureLocalFolderSkeleton();
    await syncExistingPageFolders(newEditorDocument.pages);

    await createPageFoldersTsConfigsIfNotExist(newEditorDocument.pages);

    const newLocalDocumentFiles = editorDocumentToLocalDocumentFiles(
      newEditorDocument
    );

    await Promise.all(
      newLocalDocumentFiles.map(localFile =>
        filesWatcher.ignoredWriteFile(localFile.path, localFile.content)
      )
    );
  };

  const getSiteDocument = async () => {
    const localDocumentFiles = await readLocalDocumentFiles(siteRootPath);
    return localDocumentFilesToEditorDocument(localDocumentFiles);
  };

  const updateCode = async ({
    modifiedFiles = [],
    copiedFiles = [],
    deletedFiles = []
  } = {}) => {
    await ensureLocalFolderSkeleton();
    await createRootCodeFoldersTsConfigsIfNotExist();

    const existingLocalPageFilePaths = await listLocalPageFiles(siteRootPath);

    const editorPathToLocalPath = editorPath =>
      editorCodePathToLocalCodePath(editorPath, existingLocalPageFilePaths);

    const localModifiedFiles = editorCodeFilesToLocalCodeFiles(
      modifiedFiles,
      existingLocalPageFilePaths
    );
    const modifications = localModifiedFiles.map(localFile =>
      filesWatcher.ignoredWriteFile(localFile.path, localFile.content)
    );

    const copies = copiedFiles.map(({ source, target }) =>
      filesWatcher.ignoredCopyFile(
        editorPathToLocalPath(source.path),
        editorPathToLocalPath(target.path)
      )
    );

    const deletes = deletedFiles.map(deletedFile =>
      filesWatcher.ignoredDeleteFile(editorPathToLocalPath(deletedFile.path))
    );

    await Promise.all([...modifications, ...copies, ...deletes]);
  };

  const getCodeFiles = async () => {
    const localCodeFiles = await readLocalCodeFiles(siteRootPath);
    return localCodeFilesToEditorCodeFiles(localCodeFiles);
  };

  return {
    updateSiteDocument,
    getSiteDocument,
    getCodeFiles,
    updateCode
  };
};

module.exports = readWrite;
