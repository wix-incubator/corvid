const fs = require("fs-extra");
const get_ = require("lodash/get");
const mapValues_ = require("lodash/mapValues");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const pickBy_ = require("lodash/pickBy");
const rimraf = require("rimraf");
const path = require("path");
const sitePaths = require("./sitePaths");
const dirAsJson = require("@wix/dir-as-json");
const flat = require("flat");

const flatten = data => flat(data, { delimiter: path.sep, safe: true });

const isCodeFile = filePath => !filePath.startsWith("public/pages");

const removeFileExtension = filename => filename.replace(/\.[^/.]+$/, "");
const stringify = content => JSON.stringify(content, null, 2);

const readWrite = (siteRootPath, filesWatcher) => {
  const getCodeFiles = async (dirPath = siteRootPath) => {
    const siteDirJson = await dirAsJson.readDirToJson(dirPath);
    const flatDirFiles = flatten(siteDirJson);
    return pickBy_(flatDirFiles, (content, path) => isCodeFile(path));
  };

  const getDocumentPartByKey = async partKey => {
    const partFullPath = fullPath(sitePaths[partKey]());
    let documentPart = {};

    if (await fs.exists(partFullPath)) {
      documentPart = mapKeys_(
        mapValues_(await dirAsJson.readDirToJson(partFullPath), JSON.parse),
        (pageValue, pageKey) => removeFileExtension(pageKey)
      );
    }
    return documentPart;
  };

  const getDocumentExtraData = async () => {
    const partFullPath = fullPath(sitePaths.extraData());
    let data = {};

    if (await fs.exists(partFullPath)) {
      data = JSON.parse(await fs.readFile(partFullPath, "utf8"));
    }
    return data;
  };

  const getSiteDocument = async () => {
    return {
      pages: merge_(
        await getDocumentPartByKey("pages"),
        await getDocumentPartByKey("lightboxes")
      ),
      styles: await getDocumentPartByKey("styles"),
      site: await getDocumentPartByKey("site"),
      extraData: await getDocumentExtraData()
    };
  };

  const payloadConvertors = {
    pages: pagePaylaod => {
      return Object.keys(pagePaylaod).map(pageId => {
        const isPopup = get_(pagePaylaod, [pageId, "isPopUp"]);
        return {
          path: isPopup
            ? sitePaths.lightboxes(pageId)
            : sitePaths.pages(pageId),
          content: pagePaylaod[pageId]
        };
      });
    },
    styles: stylesPayload => {
      return Object.keys(stylesPayload).map(keyName => {
        return {
          path: sitePaths.styles(keyName),
          content: stylesPayload[keyName]
        };
      });
    },
    site: sitePayload => {
      return Object.keys(sitePayload).map(keyName => {
        return {
          path: sitePaths.site(keyName),
          content: sitePayload[keyName]
        };
      });
    },
    extraData: extraDataPayload => {
      return [
        {
          path: sitePaths.extraData(),
          content: extraDataPayload
        }
      ];
    }
  };

  const deleteExistingFolders = async () => {
    if (await fs.exists(fullPath(sitePaths.extraData()))) {
      await fs.unlink(fullPath(sitePaths.extraData()));
    }

    await Promise.all([
      new Promise(resolve => rimraf(fullPath(sitePaths.pages()), resolve)),
      new Promise(resolve => rimraf(fullPath(sitePaths.lightboxes()), resolve)),
      new Promise(resolve => rimraf(fullPath(sitePaths.styles()), resolve)),
      new Promise(resolve => rimraf(fullPath(sitePaths.site()), resolve))
    ]);
  };

  const updateSiteDocument = async newDocumentPayload => {
    await deleteExistingFolders();
    // convert payload to filesToWrite
    const filesToWrite = Object.keys(newDocumentPayload).map(paylodKey => {
      return payloadConvertors[paylodKey](newDocumentPayload[paylodKey]);
    });

    // write all files to file system
    const filesPromises = [];
    filesToWrite.forEach(filesArray => {
      filesArray.forEach(file => {
        filesPromises.push(
          filesWatcher.ignoredWriteFile(file.path, stringify(file.content))
        );
      });
    });

    await Promise.all(filesPromises);
  };

  const fullPath = filePath => path.resolve(siteRootPath, filePath);

  const modifyFile = (content, filePath) => {
    const fullFilePath = fullPath(filePath);
    fs.ensureDir(path.dirname(fullFilePath));
    return fs.writeFile(fullFilePath, content);
  };

  const copyFile = ({ sourcePath, targetPath }) =>
    fs.copyFile(fullPath(sourcePath), fullPath(targetPath));
  const deleteFile = filePath => fs.unlink(fullPath(filePath));

  const updateCode = async updateRequest => {
    const { modifiedFiles, copiedFiles, deletedFiles } = updateRequest;
    try {
      const updates = Object.keys(modifiedFiles).map(filePath =>
        filesWatcher.ignoredWriteFile(filePath, modifiedFiles[filePath])
      );
      const copies = copiedFiles.map(({ sourcePath, targetPath }) =>
        filesWatcher.ignoredCopyFile(sourcePath, targetPath)
      );
      const deletes = deletedFiles.map(filesWatcher.ignoredDeleteFile);
      await Promise.all([...updates, ...copies, ...deletes]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("files save error", error);
    }
  };

  return {
    updateSiteDocument,
    getSiteDocument,
    getCodeFiles,
    updateCode
  };
};

module.exports = readWrite;
