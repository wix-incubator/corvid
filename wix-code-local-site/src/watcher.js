const path = require("path");
const fs = require("fs-extra");
const chokidar = require("chokidar");

const ensureWriteFile = async (path, content) => {
  await fs.ensureFile(path);
  await fs.writeFile(path, content);
};

const watch = async rootPath => {
  const watcher = chokidar.watch(rootPath, {
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

  const fullPath = relativePath => path.join(rootPath, relativePath);

  return {
    close: () => watcher.close(),

    onAdd: callback => {
      watcher.on("add", async relativePath => {
        callback(
          relativePath,
          await fs.readFile(fullPath(relativePath), "utf8")
        );
      });
    },

    onChange: callback => {
      watcher.on("change", async relativePath => {
        callback(
          relativePath,
          await fs.readFile(fullPath(relativePath), "utf8")
        );
      });
    },

    onDelete: callback => {
      watcher.on("unlink", relativePath => {
        callback(relativePath);
      });
    },

    ignoredWriteFile: async (relativePath, content) => {
      watcher.unwatch(relativePath);
      await ensureWriteFile(fullPath(relativePath), content);
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
