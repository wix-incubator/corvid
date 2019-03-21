/* eslint-disable no-console */
const path = require("path");
const childProcess = require("child_process");
const process = require("process");
const { BrowserWindow } = require("electron");

const isHeadlessMode = !!process.env.WIXCODE_CLI_HEADLESS;
const isDevTools = !!process.env.WIXCODE_CLI_DEVTOOLS;

function launch(file, options = {}) {
  const cp = childProcess.spawn(
    path.resolve(
      path.join(__dirname, "..", "..", "node_modules", ".bin", "electron")
    ),
    [path.resolve(path.join(file))],
    {
      windowsHide: true,
      ...options
    }
  );

  if (options.detached) {
    cp.unref();
  } else {
    cp.stdout.on("data", function(data) {
      process.stdout.write(data.toString());
    });

    cp.stderr.on("data", function(data) {
      process.stderr.write(data.toString());
    });

    cp.on("exit", code => {
      process.exit(code);
    });
  }
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
