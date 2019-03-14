const fs = require("fs-extra");
const get_ = require("lodash/get");
const mapValues_ = require("lodash/mapValues");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const rimraf = require("rimraf");
const path = require("path");
const sitePaths = require("./sitePaths");
const dirAsJson = require("@wix/dir-as-json");

const removeFileExtension = filename => filename.replace(/\.[^/.]+$/, "");
const stringify = content => JSON.stringify(content, null, 2);
const deleteFolderContentAndEnsure = async folderPath => {
  await new Promise(resolve => rimraf(folderPath, resolve));
  await fs.ensureDir(folderPath);
};

const readWrite = (siteRootPath, filesWatcher) => {
  const getCode = async (dirPath = siteRootPath) => {
    const dirFiles = await fs.readdir(dirPath);
    const isCodeFile = fullPath => {
      const pagesPath = path.resolve(siteRootPath, "public", "pages");
      return path.relative(pagesPath, fullPath).startsWith("..");
    };
    const getCodeFile = async fullPath =>
      isCodeFile(fullPath)
        ? {
            [path.relative(siteRootPath, fullPath)]: await fs.readFile(
              fullPath,
              "utf8"
            )
          }
        : {};
    return dirFiles.reduce(async (dirAsJsonPromise, relativePath) => {
      const fullPath = path.join(dirPath, relativePath);
      const stats = await fs.stat(fullPath);
      const dirAsJson = await dirAsJsonPromise;
      return Object.assign(
        {},
        dirAsJson,
        stats.isDirectory()
          ? await getCode(fullPath)
          : await getCodeFile(fullPath)
      );
    }, {});
  };

  const getDocumentPartByKeyIfExist = async (
    partKey,
    destinationKey = partKey
  ) => {
    const partFullPath = fullPath(sitePaths[partKey]());
    let documentPart = {};

    if (await fs.exists(partFullPath)) {
      documentPart = {
        [destinationKey]: mapKeys_(
          mapValues_(await dirAsJson.readDirToJson(partFullPath), pageAsJson =>
            JSON.parse(pageAsJson)
          ),
          (pageValue, pageKey) => removeFileExtension(pageKey)
        )
      };
    }
    return documentPart;
  };

  const getDocumentExtraDataIfExist = async () => {
    const partFullPath = fullPath(sitePaths.extraData());
    let data = {};

    if (await fs.exists(partFullPath)) {
      data = {
        extraData: await fs.readFile(partFullPath, "utf8")
      };
    }
    return data;
  };

  const getSiteDocument = async () => {
    const document = merge_(
      await getDocumentPartByKeyIfExist("pages"),
      await getDocumentPartByKeyIfExist("lightboxes", "pages"),
      await getDocumentPartByKeyIfExist("styles"),
      await getDocumentPartByKeyIfExist("site"),
      await getDocumentExtraDataIfExist()
    );
    return document;
  };

  const payloadConvertors = {
    pages: async pagePaylaod => {
      const pagesPath = fullPath(sitePaths.pages());
      const lightboxesPath = fullPath(sitePaths.lightboxes());
      await deleteFolderContentAndEnsure(pagesPath);
      await deleteFolderContentAndEnsure(lightboxesPath);

      let atLeastOnePopup = false;
      const filesToWrite = Object.keys(pagePaylaod).map(pageId => {
        const isPopup = get_(pagePaylaod, pageId + ".isPopUp");
        if (isPopup) atLeastOnePopup = true;
        return {
          path: isPopup
            ? sitePaths.lightboxes(pageId)
            : sitePaths.pages(pageId),
          content: pagePaylaod[pageId]
        };
      });
      // remove lightboxes folder if all pages are not popup's
      if (!atLeastOnePopup) {
        await new Promise(resolve => rimraf(lightboxesPath, resolve));
      }
      return filesToWrite;
    },
    styles: async stylesPayload => {
      const stylesPath = fullPath(sitePaths.styles());
      await deleteFolderContentAndEnsure(stylesPath);

      return Object.keys(stylesPayload).map(keyName => {
        return {
          path: sitePaths.styles(keyName),
          content: stylesPayload[keyName]
        };
      });
    },
    site: async sitePayload => {
      const sitePath = fullPath(sitePaths.site());
      await deleteFolderContentAndEnsure(sitePath);

      return Object.keys(sitePayload).map(keyName => {
        return {
          path: sitePaths.site(keyName),
          content: sitePayload[keyName]
        };
      });
    },
    extraData: async extraDataPayload => {
      await fs.unlink(fullPath(sitePaths.extraData()));

      return {
        path: sitePaths.extraData(),
        content: extraDataPayload
      };
    }
  };

  const updateSiteDocument = async newDocumentPayload => {
    // convert payload to filesToWrite
    const filesToWrite = await Promise.all(
      Object.keys(newDocumentPayload).map(async paylodKey => {
        return await payloadConvertors[paylodKey](
          newDocumentPayload[paylodKey]
        );
      })
    );

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
      let updatePromises = [];
      updatePromises = Object.keys(modifiedFiles).map(filePath =>
        modifyFile(modifiedFiles[filePath], filePath)
      );
      updatePromises = updatePromises.concat(copiedFiles.forEach(copyFile));
      updatePromises = updatePromises.concat(deletedFiles.forEach(deleteFile));
      await Promise.all(updatePromises);
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("files save error", error);
      return { success: false, error };
    }
  };

  return {
    updateSiteDocument,
    getSiteDocument,
    getCode,
    updateCode
  };
};

module.exports = readWrite;
