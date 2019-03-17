const fs = require("fs-extra");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);
  const isCodeFile = filePath => !(filePath.startsWith("public/pages") && filePath.endsWith('.json'));
  const onCodeChanged = callback => {
    watcher.onAdd((filePath, content) => {
      if (isCodeFile(filePath)) {
        // callback("add", filePath, content);
        callback({toModify: {[filePath]: content}});
      }
    });
    watcher.onChange((filePath, content) => {
      if (isCodeFile(filePath)) {
        // callback("change", filePath, content);
        callback({toModify: {[filePath]: content}});
      }
    });
    watcher.onDelete(filePath => {
      if (isCodeFile(filePath)) {
        // callback("delete", filePath);
        callback({toDelete: {[filePath]: ''}});

      }
    });
  };
  return {
    close: watcher.close,

    isEmpty: async () => {
      const sitePathExists = await fs.exists(siteRootPath);
      const siteContents = sitePathExists ? await fs.readdir(siteRootPath) : [];
      return siteContents.length === 0;
    },

    getDocument: readWrite.getDocument,
    updateSiteDocument: readWrite.updateSiteDocument,
    getCode: readWrite.getCode,
    updateCode: readWrite.updateCode,
    onCodeChanged

    // onDocumentChanged: () => {},
  };
};

module.exports = initSiteManager;
