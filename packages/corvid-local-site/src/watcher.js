/* eslint-disable no-console */
const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const find_ = require("lodash/find");
const reject_ = require("lodash/reject");
const logger = require("corvid-local-logger");
const sitePaths = require("./sitePaths");
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

  const shouldIgnoreFile = watchPath => {
    return !sitePaths.isSitePath(rootPath, watchPath);
  };
  const isUnderRoot = relativePath =>
    !path.relative(rootPath, fullPath(relativePath)).startsWith("..");

  const assertUnderRoot = relativePath => {
    if (!isUnderRoot(relativePath)) {
      throw new Error(getMessage("Watcher_Not_Under_Root_Error"));
    }
  };

  const watcher = chokidar.watch(rootPath, {
    ignored: shouldIgnoreFile,
    persistent: true,
    ignoreInitial: true,
    cwd: rootPath,
    awaitWriteFinish: true,
    followSymlinks: false,
    disableGlobbing: true,
    alwaysStat: true
  });

  watcher
    .on("raw", (event, path, details) => {
      console.log("Raw event info:", event, path, details);
    })
    .on("addDir", (path, ...rest) =>
      console.log(`Directory ${path} has been added`, rest)
    )
    .on("unlinkDir", (path, ...rest) =>
      console.log(`Directory ${path} has been removed`, rest)
    )
    .on("error", (error, ...rest) =>
      console.log(`Watcher error: ${error}`, rest)
    );

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

  const isIgnoredAction = (type, path, mtimeMs = Date.now()) => {
    console.log({
      type,
      path,
      ignoreAll,
      mtimeMs,
      ignoreBefore,
      afterIgnore: mtimeMs - ignoreBefore,
      ignoredByTS: mtimeMs < ignoreBefore
    });
    return (
      ignoreAll ||
      mtimeMs < ignoreBefore ||
      !!find_(actionsToIgnore, { type, path })
    );
  };

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
            sitePaths.fromLocalCode(posixRelativePath),
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
            sitePaths.fromLocalCode(posixRelativePath),
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
          callback(sitePaths.fromLocalCode(posixRelativePath));
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
      logger.debug(
        getMessage("Watcher_Ignored_Write_Log", { path: relativePath })
      );
      try {
        ignoreAction("write", relativePath);
        assertUnderRoot(relativePath);
        await ensureWriteFile(fullPath(relativePath), content);
      } catch (e) {
        logger.error(
          getMessage("Watcher_Ignored_Write_Fail_Log", {
            path: relativePath,
            message: e.message
          })
        );
        removeFromIgnoredActions("write", relativePath);
        throw e;
      }
    },

    ignoredEnsureFile: async relativePath => {
      logger.debug(
        getMessage("Watcher_Ignored_Ensure_Log", { path: relativePath })
      );
      const fullPathFile = fullPath(relativePath);
      if (await fs.exists(fullPathFile)) return;
      try {
        ignoreAction("write", relativePath);
        assertUnderRoot(relativePath);
        await fs.ensureFile(fullPathFile);
      } catch (e) {
        logger.error(
          getMessage("Watcher_Ignored_Ensure_Fail_Log", {
            path: relativePath,
            message: e.message
          })
        );
        removeFromIgnoredActions("write", relativePath);
        throw e;
      }
    },

    ignoredDeleteFile: async relativePath => {
      logger.debug(
        getMessage("Watcher_Ignored_Delete_Log", { path: relativePath })
      );
      try {
        ignoreAction("delete", relativePath);
        assertUnderRoot(relativePath);
        await fs.unlink(fullPath(relativePath));
      } catch (e) {
        logger.error(
          getMessage("Watcher_Ignored_Delete_Fail_Log", {
            path: relativePath,
            message: e.message
          })
        );
        removeFromIgnoredActions("delete", relativePath);
        throw e;
      }
    },

    ignoredCopyFile: async (relativeSourcePath, relativeTargetPath) => {
      logger.debug(
        getMessage("Watcher_Ignored_Copy_Log", {
          sourcePath: relativeSourcePath,
          targetPath: relativeTargetPath
        })
      );
      try {
        ignoreAction("write", relativeTargetPath);
        assertUnderRoot(relativeSourcePath);
        assertUnderRoot(relativeTargetPath);

        await fs.copyFile(
          fullPath(relativeSourcePath),
          fullPath(relativeTargetPath)
        );
      } catch (e) {
        getMessage("Watcher_Ignored_Copy_Fail_Log", {
          message: e.message
        });
        removeFromIgnoredActions("write", relativeTargetPath);
        throw e;
      }
    },

    ignoredMoveFile: async (relativeSourcePath, relativeTargetPath) => {
      logger.debug(
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
      } catch (e) {
        removeFromIgnoredActions("delete", relativeSourcePath);
        removeFromIgnoredActions("write", relativeTargetPath);
        throw e;
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
