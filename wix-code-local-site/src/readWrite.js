const fs = require("fs-extra");
const path = require("path");
const sitePaths = require("./sitePaths");

const readWrite = (siteRootPath, filesWatcher) => {
  const getCode = async (dirPath = siteRootPath) => {
    const dirFiles = await fs.readdir(dirPath);
    return dirFiles.reduce(async (dirAsJsonPromise, relativePath) => {
      const fullPath = path.join(dirPath, relativePath);
      const stats = await fs.stat(fullPath);
      const dirAsJson = await dirAsJsonPromise;
      return Object.assign(
        {},
        dirAsJson,
        stats.isDirectory()
          ? await getCode(fullPath)
          : {
              [path.relative(siteRootPath, fullPath)]: await fs.readFile(
                fullPath,
                "utf8"
              )
            }
      );
    }, {});
  };

  const updateDocument = async newDocument => {
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

  const getDocument = () => ({});

  const updateCode = () => ({});

  return {
    updateDocument,
    getCode,
    getDocument,
    updateCode
  };
};

module.exports = readWrite;
