const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(watcher);

  return {
    close: watcher.close,

    // getDocument: readWrite.getDocument,
    overrideDocument: readWrite.overrideDocument
    // getCode: readWrite.getCode,
    // updateCode: readWrite.updateCode,

    // onDocumentChanged: () => {},
    // onCodeChanged: () => {}
  };
};

module.exports = initSiteManager;
