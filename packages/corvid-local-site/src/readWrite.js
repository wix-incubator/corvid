const fs = require("fs-extra");
const get_ = require("lodash/get");
const set_ = require("lodash/set");
const mapValues_ = require("lodash/mapValues");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const filter_ = require("lodash/filter");
const pickBy_ = require("lodash/pickBy");
const flatten_ = require("lodash/flatten");
const partial_ = require("lodash/partial");
const path = require("path");
const sitePaths = require("./sitePaths");
const dirAsJson = require("corvid-dir-as-json");
const logger = require("corvid-local-logger");
const getMessage = require("./messages");
const { prettyStringify, tryToPrettifyJsonString } = require("./prettify");
const { localFileSystemLayout } = require("./versions.json");

const removeFileExtension = filename => filename.replace(/\.[^/.]+$/, "");

const readWrite = (siteRootPath, filesWatcher) => {
  const fullPath = filePath => path.resolve(siteRootPath, filePath);

  const getCodeFiles = async (dirPath = siteRootPath) => {
    const siteDirJson = await dirAsJson.readDirToJson(dirPath, {
      delimiter: "/"
    });

    const codeFilesByPath = pickBy_(siteDirJson, (_, localFilePath) =>
      sitePaths.isCodeFile(localFilePath)
    );

    return Object.keys(codeFilesByPath).map(localFilePath => ({
      path: sitePaths.fromLocalCode(localFilePath),
      content: codeFilesByPath[localFilePath]
    }));
  };

  const getFilenameFromKey = (value, key) => {
    const isPage = get_(value, "pageId");
    if (isPage) {
      return value.pageId;
    } else {
      return removeFileExtension(key);
    }
  };

  const getDocumentPartByKey = async partKey => {
    const partFullPath = fullPath(sitePaths[partKey]());
    let documentPart = {};

    if (await fs.exists(partFullPath)) {
      const folder = pickBy_(
        await dirAsJson.readDirToJson(partFullPath),
        (content, path) => sitePaths.isDocumentFile(path)
      );
      documentPart = mapKeys_(
        mapValues_(folder, content => unwrap(JSON.parse(content))),
        getFilenameFromKey
      );
    }
    return documentPart;
  };

  const getPages = partial_(getDocumentPartByKey, "pages");
  const getLightboxes = partial_(getDocumentPartByKey, "lightboxes");
  const getStyles = partial_(getDocumentPartByKey, "styles");
  const getSite = partial_(getDocumentPartByKey, "site");
  const getRouters = partial_(getDocumentPartByKey, "routers");
  const getMenus = partial_(getDocumentPartByKey, "menus");
  const getMetadata = async () => {
    const content = await fs.readFile(fullPath(sitePaths.metadata()), "utf8");
    return JSON.parse(content);
  };

  const getSiteDocument = async () => {
    return {
      pages: merge_(await getPages(), await getLightboxes()),
      styles: await getStyles(),
      site: await getSite(),
      routers: await getRouters(),
      menus: await getMenus(),
      documentSchemaVersion: (await getMetadata()).documentSchemaVersion
    };
  };

  const payloadToFile = pathGetter => (payload, wrapper) =>
    Object.keys(payload).map(keyName => {
      return {
        path: pathGetter(keyName),
        content: wrapper(payload[keyName])
      };
    });

  const wrapWithVersion = (documentSchemaVersion, content) => ({
    content,
    documentSchemaVersion
  });
  const unwrap = wrapped => {
    return wrapped.content;
  };

  const payloadConvertors = {
    pages: (pagePayload, wrapper) => {
      return Object.values(pagePayload).map(page => {
        const isPopup = get_(page, "isPopup");
        return {
          path: isPopup ? sitePaths.lightboxes(page) : sitePaths.pages(page),
          content: wrapper(page)
        };
      });
    },
    styles: payloadToFile(sitePaths.styles),
    site: payloadToFile(sitePaths.site),
    routers: payloadToFile(sitePaths.routers),
    menus: payloadToFile(sitePaths.menus),
    documentSchemaVersion: documentSchemaVersion => ({
      path: sitePaths.metadata(),
      content: {
        documentSchemaVersion,
        localFileSystemLayout
      }
    })
  };

  const siteDocumentToFiles = siteDocument => {
    const documentSchemaVersion = siteDocument.documentSchemaVersion;
    if (!siteDocument.documentSchemaVersion) {
      set_(siteDocument, "documentSchemaVersion", "");
    }
    return flatten_(
      Object.keys(siteDocument).map(paylodKey => {
        if (payloadConvertors.hasOwnProperty(paylodKey)) {
          return payloadConvertors[paylodKey](
            siteDocument[paylodKey],
            partial_(wrapWithVersion, documentSchemaVersion)
          );
        } else {
          const message = getMessage("ReadWrite_Unknown_PropertyLog", {
            property: paylodKey
          });
          logger.warn(message);
          return [];
        }
      })
    );
  };

  const deleteFolder = async folderPath => {
    if (!(await fs.exists(fullPath(folderPath)))) {
      return;
    }
    const filesPaths = (await fs.readdir(fullPath(folderPath)))
      .filter(fileName => sitePaths.isDocumentFile(fileName))
      .map(fileName => `${folderPath}/${fileName}`);

    const filePromises = filesPaths.map(filesRelativePath => {
      return filesWatcher.ignoredDeleteFile(filesRelativePath);
    });

    return Promise.all(filePromises);
  };

  const deleteExistingFolders = async () => {
    await Promise.all([
      deleteFolder(sitePaths.pages()),
      deleteFolder(sitePaths.lightboxes()),
      deleteFolder(sitePaths.styles()),
      deleteFolder(sitePaths.site()),
      deleteFolder(sitePaths.routers()),
      deleteFolder(sitePaths.menus())
    ]);
  };

  const syncLocalPageCodeFilesWithLocalDocument = async () => {
    const existingPageRelatedFiles = await getLocalPageFiles();

    const exitingPageCodeFilesByPageId = mapKeys_(
      existingPageRelatedFiles.filter(
        filePath =>
          sitePaths.isCodeFile(filePath) &&
          !sitePaths.isLocalMasterPageCodePath(filePath)
      ),
      filePath => sitePaths.matchLocalPageCodePath(filePath).pageId
    );

    const requiredPageCodeFilesByPageId = mapKeys_(
      existingPageRelatedFiles
        .filter(filePath => sitePaths.isDocumentFile(filePath))
        .map(pageDocumentPage =>
          sitePaths.fromPageFileToCodeFile(pageDocumentPage)
        ),
      filePath => sitePaths.matchLocalPageCodePath(filePath).pageId
    );

    const modifications = Object.keys(requiredPageCodeFilesByPageId).map(
      pageId => {
        const requiredCodePath = requiredPageCodeFilesByPageId[pageId];
        const existingCodePath = exitingPageCodeFilesByPageId[pageId];
        if (!existingCodePath) {
          return filesWatcher.ignoredEnsureFile(requiredCodePath);
        }
        if (existingCodePath && existingCodePath !== requiredCodePath) {
          return filesWatcher.ignoredMoveFile(
            existingCodePath,
            requiredCodePath
          );
        }
        return Promise.resolve();
      }
    );

    const deletions = filter_(
      exitingPageCodeFilesByPageId,
      (_, pageId) => !requiredPageCodeFilesByPageId[pageId]
    ).map(fileToDelete => filesWatcher.ignoredDeleteFile(fileToDelete));
    await Promise.all([...modifications, ...deletions]);
  };

  const updateSiteDocument = async newDocumentPayload => {
    await deleteExistingFolders();

    const filesToWrite = siteDocumentToFiles(newDocumentPayload);
    await Promise.all(
      filesToWrite.map(file =>
        filesWatcher.ignoredWriteFile(file.path, prettyStringify(file.content))
      )
    );

    await syncLocalPageCodeFilesWithLocalDocument();
  };

  const ensureCodeFoldersExists = async () => {
    await Promise.all([
      ...Object.values(sitePaths.codeFolders).map(codeFolderPath =>
        fs.ensureDir(fullPath(codeFolderPath))
      ),
      filesWatcher.ignoredEnsureFile(sitePaths.localMasterPageCodePath())
    ]);
  };

  const getLocalPageFiles = async () => {
    const [pageFiles, lightboxFiles] = await Promise.all(
      [sitePaths.pages(), sitePaths.lightboxes()].map(subDir => {
        const fullPath = path.posix.join(siteRootPath, subDir);
        return dirAsJson
          .readDirToJson(fullPath, {
            readFiles: false,
            delimiter: "/",
            safe: true
          })
          .then(dirJson =>
            Object.keys(dirJson).map(relativePath =>
              path.posix.join(subDir, relativePath)
            )
          );
      })
    );

    return [...pageFiles, ...lightboxFiles];
  };

  const updateCode = async updateRequest => {
    await ensureCodeFoldersExists();

    const localPageFiles = await getLocalPageFiles();
    const toLocalPath = filePath =>
      sitePaths.toLocalCode(filePath, localPageFiles);

    const {
      modifiedFiles = [],
      copiedFiles = [],
      deletedFiles = []
    } = updateRequest;

    const updates = modifiedFiles.map(file =>
      filesWatcher.ignoredWriteFile(
        toLocalPath(file),
        // TODO: refactor. we shouldn't deal with specific file types here
        sitePaths.isEditorDatabaseSchemaPath(file.path)
          ? tryToPrettifyJsonString(file.content)
          : file.content
      )
    );

    const copies = copiedFiles.map(({ source, target }) =>
      filesWatcher.ignoredCopyFile(toLocalPath(source), toLocalPath(target))
    );

    const deletes = deletedFiles.map(file =>
      filesWatcher.ignoredDeleteFile(toLocalPath(file))
    );

    return await Promise.all([...updates, ...copies, ...deletes]);
  };

  return {
    updateSiteDocument,
    getSiteDocument,
    getCodeFiles,
    updateCode
  };
};

module.exports = readWrite;
