const fs = require("fs-extra");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");
const sitePaths = require("./sitePaths");
const reject_ = require("lodash/reject");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);
  const codeChangedListeners = [];
  const documentChangedListeners = [];

  watcher.onAdd((filePath, content) => {
    if (sitePaths.isCodeFile(filePath)) {
      const modifiedFiles = [{ path: filePath, content }];
      codeChangedListeners.forEach(cb =>
        cb({ modifiedFiles, deleteFiles: [] })
      );
    } else {
      documentChangedListeners.forEach(cb => cb(filePath));
    }
  });
  watcher.onChange((filePath, content) => {
    if (sitePaths.isCodeFile(filePath)) {
      const modifiedFiles = [{ path: filePath, content }];
      codeChangedListeners.forEach(cb =>
        cb({ modifiedFiles, deleteFiles: [] })
      );
    } else {
      documentChangedListeners.forEach(cb => cb(filePath));
    }
  });
  watcher.onDelete(filePath => {
    if (sitePaths.isCodeFile(filePath)) {
      const deleteFiles = [{ path: filePath }];
      codeChangedListeners.forEach(cb =>
        cb({ modifiedFiles: [], deleteFiles })
      );
    } else {
      documentChangedListeners.forEach(cb => cb(filePath));
    }
  });

  const onCodeChanged = cb => {
    codeChangedListeners.push(cb) - 1;
    return () => reject_(documentChangedListeners, cb);
  };

  const onDocumentChanged = cb => {
    documentChangedListeners.push(cb);
    return reject_(documentChangedListeners, cb);
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
    onCodeChanged,
    onDocumentChanged
  };
};

module.exports = initSiteManager;
