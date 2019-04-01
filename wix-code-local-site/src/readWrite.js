const fs = require("fs-extra");
const get_ = require("lodash/get");
const mapValues_ = require("lodash/mapValues");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const map_ = require("lodash/map");
const pickBy_ = require("lodash/pickBy");
const flatten_ = require("lodash/flatten");
const partial_ = require("lodash/partial");
const isObject_ = require("lodash/isObject");
const rimraf = require("rimraf");
const path = require("path");
const sitePaths = require("./sitePaths");
const dirAsJson = require("@wix/dir-as-json");
const flat = require("flat");

const flatten = data => flat(data, { delimiter: path.sep, safe: true });

const removeFileExtension = filename => filename.replace(/\.[^/.]+$/, "");
const stringify = content => JSON.stringify(content, null, 2);
const isEmptyFolder = content => isObject_(content);
const readWrite = (siteRootPath, filesWatcher) => {
  const fullPath = filePath => path.resolve(siteRootPath, filePath);
  const getCodeFiles = async (dirPath = siteRootPath) => {
    const siteDirJson = await dirAsJson.readDirToJson(dirPath);
    const flatDirFiles = mapKeys_(
      flatten(siteDirJson),
      (fileContent, filePath) => sitePaths.fromLocalCode(filePath)
    );
    const codeFiles = pickBy_(
      flatDirFiles,
      (content, path) => sitePaths.isCodeFile(path) && !isEmptyFolder(content)
    );
    return map_(codeFiles, (content, path) => ({ content, path }));
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

  const deleteFolder = folderPath =>
    new Promise(resolve =>
      rimraf(sitePaths.getDocumentFolderRegex(fullPath(folderPath)), resolve)
    );

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

  const updateSiteDocument = async newDocumentPayload => {
    await deleteExistingFolders();
    // convert payload to filesToWrite
    const filesToWrite = siteDocumentToFiles(newDocumentPayload);

    // write all files to file system
    const filesPromises = filesToWrite.map(file =>
      filesWatcher.ignoredWriteFile(file.path, stringify(file.content))
    );
    await Promise.all(filesPromises);
  };

  const ensureCodeFoldersExsist = async () => {
    await Promise.all([
      Object.values(sitePaths.codeFolders).map(codeFolderPath =>
        filesWatcher.ignoredWriteFolder(codeFolderPath)
      )
    ]);
  };

  const updateCode = async updateRequest => {
    await ensureCodeFoldersExsist();
    const {
      modifiedFiles = [],
      copiedFiles = [],
      deletedFiles = []
    } = updateRequest;

    const updates = modifiedFiles.map(file =>
      filesWatcher.ignoredWriteFile(sitePaths.toLocalCode(file), file.content)
    );

    const copies = copiedFiles.map(({ sourcePath, targetPath }) =>
      filesWatcher.ignoredCopyFile(
        sitePaths.toLocalCode(sourcePath),
        sitePaths.toLocalCode(targetPath)
      )
    );

    const deletes = deletedFiles.map(file =>
      filesWatcher.ignoredDeleteFile(sitePaths.toLocalCode(file))
    );

    await Promise.all([...updates, ...copies, ...deletes]);
  };

  return {
    updateSiteDocument,
    getSiteDocument,
    getCodeFiles,
    updateCode
  };
};

module.exports = readWrite;
