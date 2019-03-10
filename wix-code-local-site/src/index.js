const fs = require("fs-extra");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);

  return {
    close: watcher.close,

    isEmpty: async () => {
      const sitePathExists = await fs.exists(siteRootPath);
      const siteContents = sitePathExists ? await fs.readdir(siteRootPath) : [];
      return siteContents.length === 0;
    },

    // getDocument: readWrite.getDocument,
    overrideDocument: readWrite.overrideDocument,
    getCode: readWrite.getCode
    // updateCode: readWrite.updateCode,

    // onDocumentChanged: () => {},
    // onCodeChanged: () => {}
  };
};

module.exports = initSiteManager;
