const fs = require("fs-extra");
const get_ = require("lodash/get");
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
const util = require("util");
const logger = require("corvid-local-logger");

const backupsPath = ".backup";
const { prettyStringify, tryToPrettifyJsonString } = require("./prettify");

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
        mapValues_(folder, JSON.parse),
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

  const getSiteDocument = async () => {
    return {
      pages: merge_(await getPages(), await getLightboxes()),
      styles: await getStyles(),
      site: await getSite(),
      routers: await getRouters(),
      menus: await getMenus()
    };
  };

  const payloadToFile = pathGetter => payload =>
    Object.keys(payload).map(keyName => {
      return {
        path: pathGetter(keyName),
        content: payload[keyName]
      };
    });

  const payloadConvertors = {
    pages: pagePayload => {
      return Object.values(pagePayload).map(page => {
        const isPopup = get_(page, "isPopup");
        return {
          path: isPopup ? sitePaths.lightboxes(page) : sitePaths.pages(page),
          content: page
        };
      });
    },
    styles: payloadToFile(sitePaths.styles),
    site: payloadToFile(sitePaths.site),
    routers: payloadToFile(sitePaths.routers),
    menus: payloadToFile(sitePaths.menus)
  };

  const siteDocumentToFiles = siteDocument =>
    flatten_(
      Object.keys(siteDocument).map(paylodKey => {
        if (payloadConvertors.hasOwnProperty(paylodKey)) {
          return payloadConvertors[paylodKey](siteDocument[paylodKey]);
        } else {
          // eslint-disable-next-line no-console
          console.error(`Unknown document property ${paylodKey}`);
          return [];
        }
      })
    );

  const deleteFolder = async folderPath => {
    if (!(await fs.exists(fullPath(folderPath)))) {
      return;
    }
    const filesPaths = (await fs.readdir(fullPath(folderPath)))
      .filter(fileName => sitePaths.isDocumentFile(fileName))
      .map(fileName => path.join(folderPath, fileName));

    const filePromises = filesPaths.map(filesRelativePath => {
      return filesWatcher.ignoredDeleteFile(filesRelativePath);
    });

    return Promise.all(filePromises);
  };

  const moveFolder = async (folderPath, targetPath) => {
    if (!(await fs.exists(fullPath(folderPath)))) {
      return;
    }
    deleteFolder(targetPath);
    filesWatcher.ignoredWriteFolder(targetPath);
    if (!(await fs.exists(fullPath(folderPath)))) {
      return;
    }
    const filesPaths = (await fs.readdir(fullPath(folderPath)))
      .filter(fileName => sitePaths.isDocumentFile(fileName))
      .map(fileName => path.join(folderPath, fileName));

    const filePromises = filesPaths.map(fileRelativePath => {
      const fileTargetPath = path.join(
        targetPath,
        path.basename(fileRelativePath)
      );
      return filesWatcher.ignoredCopyFile(fileRelativePath, fileTargetPath);
    });

    return Promise.all(filePromises).then(() => deleteFolder(targetPath));
  };

  const getBackupFolderPath = folderPath =>
    path.join(backupsPath, path.basename(folderPath));

  const backupFolder = async folderPath => {
    const backupFolderPath = getBackupFolderPath(folderPath);
    await deleteFolder(backupFolderPath);
    return moveFolder(folderPath, backupFolderPath);
  };

  const actionOnDocumentFolders = action =>
    Promise.all([
      action(sitePaths.pages()),
      action(sitePaths.lightboxes()),
      action(sitePaths.styles()),
      action(sitePaths.site()),
      action(sitePaths.routers()),
      action(sitePaths.menus())
    ]);

  const rmdir = util.promisify(fs.rmdir);

  const restoreBackupFolder = async folderPath => {
    const backupPath = getBackupFolderPath(folderPath);
    if (!(await fs.exists(fullPath(backupPath)))) {
      return;
    }
    await deleteFolder(folderPath);
    await moveFolder(backupPath, folderPath);
    return rmdir(fullPath(backupPath));
  };

  const deleteBackupFolder = async folderPath => {
    const backupPath = getBackupFolderPath(folderPath);
    if (!(await fs.exists(fullPath(backupPath)))) {
      return;
    }
    await deleteFolder(backupPath);
    await rmdir(fullPath(backupPath));
  };

  const backupExistingFolders = () => actionOnDocumentFolders(backupFolder);

  const restoreBackupedFolders = () =>
    actionOnDocumentFolders(restoreBackupFolder).then(() =>
      logger.info("Site document restored from backup")
    );

  const deleteBackupFolders = () =>
    actionOnDocumentFolders(deleteBackupFolder).then(() => {
      logger.info("Backups deleted");
      return rmdir(fullPath(backupsPath));
    });

  const syncLocalPageCodeFilesWithLocalDocument = async () => {
    const existingPageRelatedFiles = await getLocalPageFiles();

    const exitingPageCodeFilesByPageId = mapKeys_(
      existingPageRelatedFiles.filter(filePath =>
        sitePaths.isCodeFile(filePath)
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
    await backupExistingFolders();

    const filesToWrite = siteDocumentToFiles(newDocumentPayload);
    await Promise.all(
      filesToWrite.map(file =>
        filesWatcher.ignoredWriteFile(file.path, prettyStringify(file.content))
      )
    )
      .then(() => {
        logger.info("Site document updated");
        return deleteBackupFolders();
      })
      .catch(e => {
        logger.error(
          "Failed to update site document. Restoring to previous state"
        );
        restoreBackupedFolders();
        throw e;
      });

    await syncLocalPageCodeFilesWithLocalDocument();
  };

  const ensureCodeFoldersExists = async () => {
    await Promise.all([
      ...Object.values(sitePaths.codeFolders).map(codeFolderPath =>
        fs.ensureDir(fullPath(codeFolderPath))
      ),
      filesWatcher.ignoredEnsureFile(sitePaths.masterPageCode())
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
