const fs = require("fs-extra");
const path = require("path").posix;

const map_ = require("lodash/map");

const { readDirToJson } = require("corvid-dir-as-json");

const {
  isPathOfCodeFile,
  isPathOfDocumentFile,
  isPathOfPageFile,
  isPathOfEmptyByDefaultCodeFile,
  pageCodeFilePath,
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
  };

  const updateSiteDocument = async newEditorDocument => {
    await ensureLocalFolderSkeleton();
    await syncExistingPageFolders(newEditorDocument.pages);

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

    const deletes = deletedFiles.map(deletedFile => {
      const localFilePath = editorPathToLocalPath(deletedFile.path);
      return isPathOfEmptyByDefaultCodeFile(localFilePath)
        ? filesWatcher.ignoredWriteFile(localFilePath, "")
        : filesWatcher.ignoredDeleteFile(localFilePath);
    });

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
