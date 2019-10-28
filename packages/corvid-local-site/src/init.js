const reject_ = require("lodash/reject");
const { UserError } = require("corvid-local-logger");

const initWatcher = require("./watcher");
const initReadWrite = require("./readWrite");
const { isPathOfCodeFile, isPathOfDocumentFile } = require("./sitePaths");
const { readFileSystemLayoutVersion } = require("./versions");
const { localCodePathToEditorCodePath } = require("./siteConverter");
const { ERRORS } = require("./messages");

const ensureLocalFileSystemVersion = async siteRootPath => {
  const existingFileSystemLayoutVersion = await readFileSystemLayoutVersion(
    siteRootPath
  );
  if (
    existingFileSystemLayoutVersion &&
    Number(existingFileSystemLayoutVersion) < 2
  ) {
    throw new UserError(ERRORS.OLD_FILE_SYSTEM_LAYOUT_NOT_SUPPORTED);
  }
};

const initSiteManager = async (siteRootPath, backupPath) => {
  await ensureLocalFileSystemVersion(siteRootPath);

  const watcher = await initWatcher(siteRootPath);
  const readWrite = initReadWrite(siteRootPath, watcher, backupPath);
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
