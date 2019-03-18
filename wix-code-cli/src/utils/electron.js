/* eslint-disable no-console */
const path = require("path");
const childProcess = require("child_process");
const process = require("process");
const { BrowserWindow } = require("electron");

const isHeadlessMode = !!process.env.WIXCODE_CLI_HEADLESS;
const isDevTools = !!process.env.WIXCODE_CLI_DEVTOOLS;

function launch(file) {
  const cp = childProcess.spawn(
    path.resolve(
      path.join(__dirname, "..", "..", "node_modules", ".bin", "electron")
    ),
    [path.resolve(path.join(file))]
  );

  cp.stdout.on("data", function(data) {
    console.log(data.toString());
  });

  cp.stderr.on("data", function(data) {
    console.error(data.toString());
  });
}

const openWindow = (windowOptions = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const win = new BrowserWindow({
        width: 1280,
        height: 960,
        show: !isHeadlessMode,
        ...windowOptions,
        webPreferences: { nodeIntegration: false }
      });

      if (isDevTools) {
        win.webContents.openDevTools({ mode: "detach" });
      }

      setTimeout(() => resolve(win), isDevTools ? 1000 : 0);
    } catch (exc) {
      reject(exc);
    }
  });
};

module.exports = {
  openWindow,
  launch
};
