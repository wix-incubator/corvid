const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const sitePaths = require("./sitePaths");

const watcherConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: true,
  followSymlinks: false,
  disableGlobbing: true
};

const ensureWriteFile = async (path, content) => {
  await fs.ensureFile(path);
  await fs.writeFile(path, content);
};

const ensureWriteFolder = async path => {
  await fs.ensureDir(path);
};

const watch = async rootPath => {
  const fullPath = relativePath => path.join(rootPath, relativePath);

  const watcher = chokidar.watch(
    sitePaths.siteFolders.map(relativePath => fullPath(relativePath)),
    Object.assign({}, watcherConfig, { cwd: rootPath })
  );

  await new Promise((resolve, reject) => {
    watcher.on("ready", () => resolve());
    watcher.on("error", () => reject());
  });

  return {
    close: () => watcher.close(),

    onAdd: callback => {
      watcher.on("add", async relativePath => {
        callback(
          sitePaths.fromLocalCode(relativePath),
          await fs.readFile(fullPath(relativePath), "utf8")
        );
      });
    },

    onChange: callback => {
      watcher.on("change", async relativePath => {
        callback(
          sitePaths.fromLocalCode(relativePath),
          await fs.readFile(fullPath(relativePath), "utf8")
        );
      });
    },

    onDelete: callback => {
      watcher.on("unlink", relativePath => {
        callback(sitePaths.fromLocalCode(relativePath));
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      watcher.unwatch(relativePath);
      await ensureWriteFile(fullPath(relativePath), content);
      watcher.add(relativePath);
    },

    ignoredWriteFolder: async relativePath => {
      watcher.unwatch(relativePath);
      await ensureWriteFolder(fullPath(relativePath));
      watcher.add(relativePath);
    },

    ignoredDeleteFile: async relativePath => {
      watcher.unwatch(relativePath);
      await fs.unlink(fullPath(relativePath));
      watcher.add(relativePath);
    },

    ignoredCopyFile: async (relativeSourcePath, relativeTargetPath) => {
      watcher.unwatch(relativeTargetPath);
      await fs.copyFile(
        fullPath(relativeSourcePath),
        fullPath(relativeTargetPath)
      );
      watcher.add(relativeTargetPath);
    }
  };
};

module.exports = watch;
