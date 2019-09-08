const reject_ = require("lodash/reject");
const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");
const { isPathOfCodeFile, isPathOfDocumentFile } = require("./sitePaths");
const { localCodePathToEditorCodePath } = require("./siteConverter");

const initSiteManager = async siteRootPath => {
  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher);
  let codeChangedCallbacks = [];
  let documentChangedCallbacks = [];

  watcher.onAdd((filePath, content) => {
    if (isPathOfCodeFile(filePath)) {
      const modifiedFiles = [
        { path: localCodePathToEditorCodePath(filePath), content }
      ];
      codeChangedCallbacks.forEach(cb =>
        cb({ modifiedFiles, deletedFiles: [] })
      );
    } else if (isPathOfDocumentFile(filePath)) {
      documentChangedCallbacks.forEach(cb => cb());
    }
  });

  watcher.onChange((filePath, content) => {
    if (isPathOfCodeFile(filePath)) {
      const modifiedFiles = [
        { path: localCodePathToEditorCodePath(filePath), content }
      ];
      codeChangedCallbacks.forEach(cb =>
        cb({ modifiedFiles, deletedFiles: [] })
      );
    } else if (isPathOfDocumentFile(filePath)) {
      documentChangedCallbacks.forEach(cb => cb());
    }
  });

  watcher.onDelete(filePath => {
    if (isPathOfCodeFile(filePath)) {
      const deletedFiles = [{ path: localCodePathToEditorCodePath(filePath) }];
      codeChangedCallbacks.forEach(cb =>
        cb({ modifiedFiles: [], deletedFiles })
      );
    } else if (isPathOfDocumentFile(filePath)) {
      documentChangedCallbacks.forEach(cb => cb());
    }
  });

  const onCodeChanged = cb => {
    codeChangedCallbacks.push(cb);
    return () => {
      codeChangedCallbacks = reject_(codeChangedCallbacks, cb);
    };
  };

  const onDocumentChanged = cb => {
    documentChangedCallbacks.push(cb);
    return () => {
      documentChangedCallbacks = reject_(documentChangedCallbacks, cb);
    };
  };

  return {
    close: watcher.close,
    pause: watcher.pause,
    resume: watcher.resume,

    getSiteDocument: readWrite.getSiteDocument,
    updateSiteDocument: readWrite.updateSiteDocument,
    updateCodeIntelligence: readWrite.updateCodeIntelligence,

    getCodeFiles: readWrite.getCodeFiles,
    updateCode: readWrite.updateCode,

    onCodeChanged,
    onDocumentChanged
  };
};

module.exports = initSiteManager;
