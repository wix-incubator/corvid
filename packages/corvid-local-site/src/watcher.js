const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const find_ = require("lodash/find");
const reject_ = require("lodash/reject");
const logger = require("corvid-local-logger");
const { isUnderPath, isSamePath } = require("./utils/fileUtils");
const { isPathRelatedToSite } = require("./sitePaths");
const getMessage = require("./messages");

const ensureWriteFile = async (path, content) => {
  await fs.ensureFile(path);
  await fs.writeFile(path, content);
};

const toPosixPath = winPath => winPath.replace(/\\/g, "/");

const watch = async givenPath => {
  let ignoreBefore = 0;
  let ignoreAll = false;
  logger.verbose(getMessage("Watcher_Start_Log", { path: givenPath }));
  const rootPath = fs.realpathSync(givenPath);
  if (rootPath !== givenPath) {
    logger.debug(getMessage("Watcher_Path_Resolved_Log", { path: rootPath }));
  }

  const fullPath = relativePath => path.join(rootPath, relativePath);

  const isUnderRoot = pathToCheck =>
    isUnderPath(rootPath, fullPath(pathToCheck));

  const shouldIgnoreFile = watchPath => {
    const isInterestingPath =
      isSamePath(rootPath, watchPath) ||
      (isUnderRoot(watchPath) && isPathRelatedToSite(rootPath, watchPath));

    return !isInterestingPath;
  };

  const assertUnderRoot = pathToCheck => {
    if (!isUnderRoot(pathToCheck)) {
      throw new Error(getMessage("Watcher_Not_Under_Root_Error"));
    }
  };

  const watcher = chokidar.watch(rootPath, {
    ignored: shouldIgnoreFile,
    persistent: true,
    ignoreInitial: true,
    cwd: rootPath,
    awaitWriteFinish: {
      stabilityThreshold: 500
    },
    followSymlinks: false,
    disableGlobbing: true,
    alwaysStat: true
  });

  await new Promise((resolve, reject) => {
    watcher.on("ready", () => resolve());
    watcher.on("error", () => reject());
  });

  let actionsToIgnore = [];

  const ignoreAction = (type, path) => {
    actionsToIgnore.push({ type, path });
  };

  const removeFromIgnoredActions = (type, path) => {
    actionsToIgnore = reject_(actionsToIgnore, { type, path });
  };

  const isIgnoredAction = (type, path, mtimeMs = Date.now()) =>
    ignoreAll ||
    mtimeMs < ignoreBefore ||
    !!find_(actionsToIgnore, { type, path });

  return {
    close: () => watcher.close(),

    onAdd: callback => {
      watcher.on("add", async (relativePath, stats) => {
        const posixRelativePath = toPosixPath(relativePath);
        if (!isIgnoredAction("write", posixRelativePath, stats.mtimeMs)) {
          logger.debug(
            getMessage("Watcher_Add_Reporting_Log", { path: posixRelativePath })
          );
          callback(
            posixRelativePath,
            await fs.readFile(fullPath(posixRelativePath), "utf8")
          );
        } else {
          logger.debug(
            getMessage("Watcher_Add_Ignoring_Log", { path: posixRelativePath })
          );
          removeFromIgnoredActions("write", posixRelativePath);
        }
      });
    },

    onChange: callback => {
      watcher.on("change", async (relativePath, stats) => {
        const posixRelativePath = toPosixPath(relativePath);
        if (!isIgnoredAction("write", posixRelativePath, stats.mtimeMs)) {
          logger.debug(
            getMessage("Watcher_Change_Reporting_Log", {
              path: posixRelativePath
            })
          );
          callback(
            posixRelativePath,
            await fs.readFile(fullPath(posixRelativePath), "utf8")
          );
        } else {
          logger.debug(
            getMessage("Watcher_Change_Ignoring_Log", {
              path: posixRelativePath
            })
          );
          removeFromIgnoredActions("write", posixRelativePath);
        }
      });
    },

    onDelete: callback => {
      watcher.on("unlink", async relativePath => {
        const posixRelativePath = toPosixPath(relativePath);
        if (!isIgnoredAction("delete", posixRelativePath)) {
          logger.debug(
            getMessage("Watcher_Delete_Reporting_Log", {
              path: posixRelativePath
            })
          );
          callback(posixRelativePath);
        } else {
          logger.debug(
            getMessage("Watcher_Delete_Ignoring_Log", {
              path: posixRelativePath
            })
          );
          removeFromIgnoredActions("delete", posixRelativePath);
        }
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      logger.silly(
        getMessage("Watcher_Ignored_Write_Log", { path: relativePath })
      );
      try {
        ignoreAction("write", relativePath);
        assertUnderRoot(relativePath);
        await ensureWriteFile(fullPath(relativePath), content);
      } catch (err) {
        logger.error(err);
        removeFromIgnoredActions("write", relativePath);
        throw err;
      }
    },

    ignoredEnsureFile: async relativePath => {
      logger.silly(
        getMessage("Watcher_Ignored_Ensure_Log", { path: relativePath })
      );
      const fullPathFile = fullPath(relativePath);
      if (await fs.exists(fullPathFile)) return;
      try {
        ignoreAction("write", relativePath);
        assertUnderRoot(relativePath);
        await fs.ensureFile(fullPathFile);
      } catch (err) {
        logger.error(err);
        removeFromIgnoredActions("write", relativePath);
        throw err;
      }
    },

    ignoredDeleteFile: async relativePath => {
      logger.silly(
        getMessage("Watcher_Ignored_Delete_Log", { path: relativePath })
      );
      try {
        ignoreAction("delete", relativePath);
        assertUnderRoot(relativePath);
        await fs.remove(fullPath(relativePath));
      } catch (err) {
        logger.error(err);
        removeFromIgnoredActions("delete", relativePath);
        throw err;
      }
    },

    ignoredCopyFile: async (relativeSourcePath, relativeTargetPath) => {
      logger.silly(
        getMessage("Watcher_Ignored_Copy_Log", {
          sourcePath: relativeSourcePath,
          targetPath: relativeTargetPath
        })
      );
      try {
        ignoreAction("write", relativeTargetPath);
        assertUnderRoot(relativeSourcePath);
        assertUnderRoot(relativeTargetPath);

        await fs.copy(
          fullPath(relativeSourcePath),
          fullPath(relativeTargetPath)
        );
      } catch (err) {
        logger.error(err);
        removeFromIgnoredActions("write", relativeTargetPath);
        throw err;
      }
    },

    ignoredMoveFile: async (relativeSourcePath, relativeTargetPath) => {
      logger.silly(
        getMessage("Watcher_Ignored_Move_Log", {
          sourcePath: relativeSourcePath,
          targetPath: relativeTargetPath
        })
      );
      try {
        ignoreAction("delete", relativeSourcePath);
        ignoreAction("write", relativeTargetPath);
        await fs.move(
          fullPath(relativeSourcePath),
          fullPath(relativeTargetPath)
        );
      } catch (err) {
        logger.error(err);
        removeFromIgnoredActions("delete", relativeSourcePath);
        removeFromIgnoredActions("write", relativeTargetPath);
        throw err;
      }
    },

    pause: () => {
      ignoreAll = true;
    },

    resume: () => {
      ignoreAll = false;
      ignoreBefore = Date.now();
    }
  };
};

module.exports = watch;
