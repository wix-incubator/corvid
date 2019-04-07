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

const getSiteRoots = rootPath =>
  sitePaths.siteFolders.map(folderPath => path.join(rootPath, folderPath));

const watch = async givenPath => {
  logger.verbose(`watching for file changes at [${givenPath}]`);
  const rootPath = fs.realpathSync(givenPath);
  if (rootPath !== givenPath) {
    logger.debug(`watched path resolved to [${rootPath}]`);
  }
  const siteRoots = getSiteRoots(rootPath);
  const fullPath = relativePath => path.join(rootPath, relativePath);
  const shouldIgnoreFile = watchPath =>
    watchPath !== rootPath &&
    !siteRoots.some(siteRoot => watchPath.startsWith(siteRoot));

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
        if (!isIgnoredAction("write", relativePath)) {
          logger.debug(`reporting new file at [${relativePath}]`);
          callback(
            sitePaths.fromLocalCode(relativePath),
            await fs.readFile(fullPath(relativePath), "utf8")
          );
        } else {
          logger.debug(`ignoring new file at [${relativePath}]`);
          removeFromIgnoredActions("write", relativePath);
        }
      });
    },

    onChange: callback => {
      watcher.on("change", async relativePath => {
        if (!isIgnoredAction("write", relativePath)) {
          logger.debug(`reporting modified file at [${relativePath}]`);
          callback(
            sitePaths.fromLocalCode(relativePath),
            await fs.readFile(fullPath(relativePath), "utf8")
          );
        } else {
          logger.debug(`ignoring modified file at [${relativePath}]`);
          removeFromIgnoredActions("write", relativePath);
        }
      });
    },

    onDelete: callback => {
      watcher.on("unlink", relativePath => {
        if (!isIgnoredAction("delete", relativePath)) {
          logger.debug(`reporting deleted file at [${relativePath}]`);
          callback(sitePaths.fromLocalCode(relativePath));
        } else {
          logger.debug(`ignoring deleted file at [${relativePath}]`);
          removeFromIgnoredActions("delete", relativePath);
        }
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      logger.debug(`writing file ${relativePath}`);
      try {
        ignoreAction("write", relativePath);
        await ensureWriteFile(fullPath(relativePath), content);
      } catch (e) {
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
        await fs.ensureFile(fullPathFile);
      } catch (e) {
        removeFromIgnoredActions("write", relativePath);
        throw e;
      }
    },

    // todo:: stop watching unwatch & watch
    ignoredWriteFolder: async relativePath => {
      logger.debug(`writing folder ${relativePath}`);
      watcher.unwatch(relativePath);
      await fs.ensureDir(fullPath(relativePath));
      watcher.add(relativePath);
    },

    ignoredDeleteFile: async relativePath => {
      logger.debug(`deleting file ${relativePath}`);
      try {
        ignoreAction("delete", relativePath);
        await fs.unlink(fullPath(relativePath));
      } catch (e) {
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
        await fs.copyFile(
          fullPath(relativeSourcePath),
          fullPath(relativeTargetPath)
        );
      } catch (e) {
        removeFromIgnoredActions("write", relativeTargetPath);
        throw e;
      }
    }
  };
};

module.exports = watch;
