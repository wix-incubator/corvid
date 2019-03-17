const fs = require("fs-extra");
const path = require("path");
const sitePaths = require("./sitePaths");
const dirAsJson = require("@wix/dir-as-json");
const flat = require("flat");
const _ = require("lodash");

const flatten = data => flat(data, { delimiter: path.sep, safe: true });

const isCodeFile = filePath => !(filePath.startsWith("public/pages") && filePath.endsWith('.json'));

const readWrite = (siteRootPath, filesWatcher) => {
  const getCodeFiles = async (dirPath = siteRootPath) => {
    const siteDirJson = await dirAsJson.readDirToJson(dirPath);
    const flatDirFiles = flatten(siteDirJson);
    return _.pickBy(flatDirFiles, (content, path) => isCodeFile(path));
  };

  const updateSiteDocument = async newDocument => {
    const newPages = newDocument.pages;
    if (newPages) {
      const newPageWrites = Object.keys(newPages).map(pageId => {
        return filesWatcher.ignoredWriteFile(
          sitePaths.page(pageId),
          newPages[pageId]
        );
      });
      await Promise.all(newPageWrites);
    }
  };

  const getDocument = async () => {
    const pages = await fs.readdir(
      path.join(siteRootPath, sitePaths.pagesPath)
    );
    return pages.reduce(async (dirAsJsonPromise, relativePath) => {
      const fullPath = path.join(
        siteRootPath,
        sitePaths.pagesPath,
        relativePath
      );
      // todo:: change to response payloaddd
      return Object.assign(
        {},
        {
          public: {
            pages: {
              [relativePath]: await fs.readFile(fullPath, "utf8")
            }
          }
        }
      );
    }, {});
  };

  const updateCode = async updateRequest => {
    const { modifiedFiles, copiedFiles = [], deletedFiles = [] } = updateRequest;
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
    getCode: getCodeFiles,
    getDocument,
    updateCode
  };
};

module.exports = readWrite;
