const path = require("path");
const chokidar = require("chokidar");

module.exports.localFilesWatcher = (basePath, onChange) => {
  let pause = false;
  const setPause = doPause => {
    pause = doPause;
  };
  const watcher = chokidar.watch(basePath);
  return new Promise(resolve => {
    watcher.on("ready", () => {
      watcher.on("all", (event, filePath) => {
        if (pause) {
          return;
        }
        if (["add", "change", "unlink"].includes(event)) {
          const relativePath = path.relative(basePath, filePath);
          console.log(event, relativePath); // eslint-disable-line no-console
          onChange(event, relativePath);
        }
      });
      resolve({
        pause: () => setPause(true),
        resume: () => setPause(false),
        close: () => watcher.close()
      });
    });
  });
};
