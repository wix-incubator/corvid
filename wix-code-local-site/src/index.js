const fs = require("fs-extra");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);
  const onCodeChanged = callback => {
    watcher.onAdd((filePath, content) => callback("add", filePath, content));
    watcher.onChange((filePath, content) =>
      callback("change", filePath, content)
    );
    watcher.onDelete(filePath => callback("delete", filePath));
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
