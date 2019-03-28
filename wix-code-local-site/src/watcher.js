const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const find_ = require("lodash/find");
const reject_ = require("lodash/reject");
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
  const rootPath = fs.realpathSync(givenPath);
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
          callback(
            sitePaths.fromLocalCode(relativePath),
            await fs.readFile(fullPath(relativePath), "utf8")
          );
        } else {
          removeFromIgnoredActions("write", relativePath);
        }
      });
    },

    onChange: callback => {
      watcher.on("change", async relativePath => {
        if (!isIgnoredAction("write", relativePath)) {
          callback(
            sitePaths.fromLocalCode(relativePath),
            await fs.readFile(fullPath(relativePath), "utf8")
          );
        } else {
          removeFromIgnoredActions("write", relativePath);
        }
      });
    },

    onDelete: callback => {
      watcher.on("unlink", relativePath => {
        if (!isIgnoredAction("delete", relativePath)) {
          callback(sitePaths.fromLocalCode(relativePath));
        } else {
          removeFromIgnoredActions("delete", relativePath);
        }
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      try {
        ignoreAction("write", relativePath);
        await ensureWriteFile(fullPath(relativePath), content);
      } catch (e) {
        removeFromIgnoredActions("write", relativePath);
      }
    },

    ignoredWriteFolder: async relativePath => {
      watcher.unwatch(relativePath);
      await ensureWriteFolder(fullPath(relativePath));
      watcher.add(relativePath);
    },

    ignoredDeleteFile: async relativePath => {
      try {
        ignoreAction("delete", relativePath);
        await fs.unlink(fullPath(relativePath));
      } catch (e) {
        removeFromIgnoredActions("delete", relativePath);
      }
    },

    ignoredCopyFile: async (relativeSourcePath, relativeTargetPath) => {
      try {
        ignoreAction("write", relativeTargetPath);
        await fs.copyFile(
          fullPath(relativeSourcePath),
          fullPath(relativeTargetPath)
        );
      } catch (e) {
        removeFromIgnoredActions("write", relativeTargetPath);
      }
    }
  };
};

module.exports = watch;
