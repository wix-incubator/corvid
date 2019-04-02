const reject_ = require("lodash/reject");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");
const sitePaths = require("./sitePaths");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);
  const codeChangedCallbacks = [];
  const documentChangedCallbacks = [];

  watcher.onAdd((filePath, content) => {
    if (sitePaths.isCodeFile(filePath)) {
      const modifiedFiles = [{ path: filePath, content }];
      codeChangedCallbacks.forEach(cb =>
        cb({ modifiedFiles, deletedFiles: [] })
      );
    } else {
      documentChangedCallbacks.forEach(cb => cb());
    }
  });
  watcher.onChange((filePath, content) => {
    if (sitePaths.isCodeFile(filePath)) {
      const modifiedFiles = [{ path: filePath, content }];
      codeChangedCallbacks.forEach(cb =>
        cb({ modifiedFiles, deletedFiles: [] })
      );
    } else {
      documentChangedCallbacks.forEach(cb => cb());
    }
  });
  watcher.onDelete(filePath => {
    if (sitePaths.isCodeFile(filePath)) {
      const deletedFiles = [{ path: filePath }];
      codeChangedCallbacks.forEach(cb =>
        cb({ modifiedFiles: [], deletedFiles })
      );
    } else {
      documentChangedCallbacks.forEach(cb => cb());
    }
  });

  const onCodeChanged = cb => {
    codeChangedCallbacks.push(cb);
    return () => reject_(codeChangedCallbacks, cb);
  };

  const onDocumentChanged = cb => {
    documentChangedCallbacks.push(cb);
    return () => reject_(documentChangedCallbacks, cb);
  };

  return {
    close: watcher.close,

    getSiteDocument: readWrite.getSiteDocument,
    updateSiteDocument: readWrite.updateSiteDocument,

    getCodeFiles: readWrite.getCodeFiles,
    updateCode: readWrite.updateCode,
    onCodeChanged,
    onDocumentChanged
  };
};

module.exports = initSiteManager;
