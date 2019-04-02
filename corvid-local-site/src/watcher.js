const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const find_ = require("lodash/find");
const reject_ = require("lodash/reject");
const debug = require("./debug");
const sitePaths = require("./sitePaths");

const ensureWriteFile = async (path, content) => {
  await fs.ensureFile(path);
  await fs.writeFile(path, content);
};

const ensureWriteFolder = async path => {
  if (!(await fs.exists(path))) {
    await fs.mkdir(path);
  }
};

const getSiteRoots = rootPath =>
  sitePaths.siteFolders.map(folderPath => path.join(rootPath, folderPath));

const watch = async givenPath => {
  debug.log(`watching for file changes at [${givenPath}]`);
  const rootPath = fs.realpathSync(givenPath);
  if (rootPath !== givenPath) {
    debug.log(`watched path resolved to [${rootPath}]`);
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
          debug.log(`reporting new file at [${relativePath}]`);
          callback(
            sitePaths.fromLocalCode(relativePath),
            await fs.readFile(fullPath(relativePath), "utf8")
          );
        } else {
          debug.log(`ignoring new file at [${relativePath}]`);
          removeFromIgnoredActions("write", relativePath);
        }
      });
    },

    onChange: callback => {
      watcher.on("change", async relativePath => {
        if (!isIgnoredAction("write", relativePath)) {
          debug.log(`reporting modified file at [${relativePath}]`);
          callback(
            sitePaths.fromLocalCode(relativePath),
            await fs.readFile(fullPath(relativePath), "utf8")
          );
        } else {
          debug.log(`ignoring modified file at [${relativePath}]`);
          removeFromIgnoredActions("write", relativePath);
        }
      });
    },

    onDelete: callback => {
      watcher.on("unlink", relativePath => {
        if (!isIgnoredAction("delete", relativePath)) {
          debug.log(`reporting deleted file at [${relativePath}]`);
          callback(sitePaths.fromLocalCode(relativePath));
        } else {
          debug.log(`ignoring deleted file at [${relativePath}]`);
          removeFromIgnoredActions("delete", relativePath);
        }
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      debug.log(`writing file ${relativePath}`);
      try {
        ignoreAction("write", relativePath);
        await ensureWriteFile(fullPath(relativePath), content);
      } catch (e) {
        removeFromIgnoredActions("write", relativePath);
        throw e;
      }
    },

    ignoredWriteFolder: async relativePath => {
      debug.log(`writing folder ${relativePath}`);
      watcher.unwatch(relativePath);
      await ensureWriteFolder(fullPath(relativePath));
      watcher.add(relativePath);
    },

    ignoredDeleteFile: async relativePath => {
      debug.log(`deleting file ${relativePath}`);
      try {
        ignoreAction("delete", relativePath);
        await fs.unlink(fullPath(relativePath));
      } catch (e) {
        removeFromIgnoredActions("delete", relativePath);
        throw e;
      }
    },

    ignoredCopyFile: async (relativeSourcePath, relativeTargetPath) => {
      debug.log(
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
