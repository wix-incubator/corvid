const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const find_ = require("lodash/find");
const reject_ = require("lodash/reject");
const logger = require("corvid-local-logger");
const sitePaths = require("./sitePaths");

const ensureWriteFile = async (path, content) => {
  await fs.ensureFile(path);
  await fs.writeFile(path, content);
};

const toPosixPath = winPath => winPath.replace(/\\/g, "/");
const assert = (value, errorMessage) => {
  if (!value) {
    throw new Error(errorMessage);
  }
};

const watch = async givenPath => {
  logger.verbose(`watching for file changes at [${givenPath}]`);
  const rootPath = fs.realpathSync(givenPath);
  if (rootPath !== givenPath) {
    logger.debug(`watched path resolved to [${rootPath}]`);
  }

  const fullPath = relativePath => path.join(rootPath, relativePath);

  const shouldIgnoreFile = watchPath => {
    return !sitePaths.isSitePath(rootPath, watchPath);
  };
  const isUnderRoot = relativePath =>
    !path.relative(rootPath, fullPath(relativePath)).startsWith("..");

  const watcher = chokidar.watch(rootPath, {
    ignored: shouldIgnoreFile,
    persistent: true,
    ignoreInitial: true,
    cwd: rootPath,
    awaitWriteFinish: true,
    followSymlinks: false,
    disableGlobbing: true
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

  const isIgnoredAction = (type, path) =>
    !!find_(actionsToIgnore, { type, path });

  return {
    close: () => watcher.close(),

    onAdd: callback => {
      watcher.on("add", async relativePath => {
        const posixRelativePath = toPosixPath(relativePath);
        if (!isIgnoredAction("write", posixRelativePath)) {
          logger.debug(`reporting new file at [${posixRelativePath}]`);
          callback(
            sitePaths.fromLocalCode(posixRelativePath),
            await fs.readFile(fullPath(posixRelativePath), "utf8")
          );
        } else {
          logger.debug(`ignoring new file at [${posixRelativePath}]`);
          removeFromIgnoredActions("write", posixRelativePath);
        }
      });
    },

    onChange: callback => {
      watcher.on("change", async relativePath => {
        const posixRelativePath = toPosixPath(relativePath);
        if (!isIgnoredAction("write", posixRelativePath)) {
          logger.debug(`reporting modified file at [${posixRelativePath}]`);
          callback(
            sitePaths.fromLocalCode(posixRelativePath),
            await fs.readFile(fullPath(posixRelativePath), "utf8")
          );
        } else {
          logger.debug(`ignoring modified file at [${posixRelativePath}]`);
          removeFromIgnoredActions("write", posixRelativePath);
        }
      });
    },

    onDelete: callback => {
      watcher.on("unlink", relativePath => {
        const posixRelativePath = toPosixPath(relativePath);
        if (!isIgnoredAction("delete", posixRelativePath)) {
          logger.debug(`reporting deleted file at [${posixRelativePath}]`);
          callback(sitePaths.fromLocalCode(posixRelativePath));
        } else {
          logger.debug(`ignoring deleted file at [${posixRelativePath}]`);
          removeFromIgnoredActions("delete", posixRelativePath);
        }
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      logger.debug(`writing file ${relativePath}`);
      try {
        ignoreAction("write", relativePath);
        assert(isUnderRoot(relativePath), "tried to write outside of project");
        await ensureWriteFile(fullPath(relativePath), content);
      } catch (e) {
        logger.error(
          `writing file ${relativePath} failed with error "${e.message}"`
        );
        removeFromIgnoredActions("write", relativePath);
        throw e;
      }
    },

    ignoredEnsureFile: async relativePath => {
      logger.debug(`ensure file ${relativePath}`);
      const fullPathFile = fullPath(relativePath);
      if (await fs.exists(fullPathFile)) return;
      try {
        ignoreAction("write", relativePath);
        assert(isUnderRoot(relativePath), "tried to write outside of project");
        await fs.ensureFile(fullPathFile);
      } catch (e) {
        logger.error(
          `writing file ${relativePath} failed with error "${e.message}"`
        );
        removeFromIgnoredActions("write", relativePath);
        throw e;
      }
    },

    ignoredDeleteFile: async relativePath => {
      logger.debug(`deleting file ${relativePath}`);
      try {
        ignoreAction("delete", relativePath);
        assert(isUnderRoot(relativePath), "tried to delete outside of project");
        await fs.unlink(fullPath(relativePath));
      } catch (e) {
        logger.error(
          `deleting file ${relativePath} failed with error "${e.message}"`
        );
        removeFromIgnoredActions("delete", relativePath);
        throw e;
      }
    },

    ignoredCopyFile: async (relativeSourcePath, relativeTargetPath) => {
      logger.debug(
        `copying file from ${relativeSourcePath} to ${relativeTargetPath}`
      );
      try {
        ignoreAction("write", relativeTargetPath);
        assert(
          isUnderRoot(relativeSourcePath),
          "tried to write outside of project"
        );
        assert(
          isUnderRoot(relativeTargetPath),
          "tried to write outside of project"
        );

        await fs.copyFile(
          fullPath(relativeSourcePath),
          fullPath(relativeTargetPath)
        );
      } catch (e) {
        logger.error(`copying file failed with error "${e.message}"`);
        removeFromIgnoredActions("write", relativeTargetPath);
        throw e;
      }
    },

    ignoredMoveFile: async (relativeSourcePath, relativeTargetPath) => {
      logger.debug(
        `moving file from ${relativeSourcePath} to ${relativeTargetPath}`
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
    }
  };
};

module.exports = watch;
