const fs = require("fs-extra");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");
const sitePaths = require("./sitePaths");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);
  const onCodeChanged = callback => {
    watcher.onAdd((filePath, content) => {
      if (sitePaths.isCodeFile(filePath)) {
        callback("add", filePath, content);
      }
    });
    watcher.onChange((filePath, content) => {
      if (sitePaths.isCodeFile(filePath)) {
        callback("change", filePath, content);
      }
    });
    watcher.onDelete(filePath => {
      if (sitePaths.isCodeFile(filePath)) {
        callback("delete", filePath);
      }
    });
  };
  return {
    close: watcher.close,

    isEmpty: async () => {
      const sitePathExists = await fs.exists(siteRootPath);
      const siteContents = sitePathExists ? await fs.readdir(siteRootPath) : [];
      return (
        siteContents.length === 0 ||
        (siteContents.length === 1 && siteContents[0] === ".wixcoderc.json")
      );
    },

    getSiteDocument: readWrite.getSiteDocument,
    updateSiteDocument: readWrite.updateSiteDocument,

    getCodeFiles: readWrite.getCodeFiles,
    updateCode: readWrite.updateCode,
    onCodeChanged

    // onDocumentChanged: () => {},
  };
};

module.exports = initSiteManager;
