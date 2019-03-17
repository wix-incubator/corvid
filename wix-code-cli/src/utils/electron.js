const process = require("process");
const { BrowserWindow } = require("electron");

const isHeadlessMode = !!process.env.WIXCODE_CLI_HEADLESS;
const isDevTools = !!process.env.WIXCODE_CLI_DEVTOOLS;

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
  isHeadlessMode,
  isDevTools,
  openWindow
};
