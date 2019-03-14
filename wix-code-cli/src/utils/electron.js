const process = require("process");
const { app, BrowserWindow } = require("electron");

module.exports = (
  onOpen,
  options = {
    onClose: () => {},
    windowOptions: {},
    openDevTools: false,
    headless: false
  }
) =>
  app.on("ready", () => {
    const headlessMode = options.headless || process.env.WIXCODE_CLI_HEADLESS;
    const openDevTools =
      options.openDevTools || process.env.WIXCODE_CLI_DEVTOOLS;
    const win = new BrowserWindow({
      width: 1280,
      height: 960,
      ...options.windowOptions,
      webPreferences: { nodeIntegration: false },
      show: !headlessMode
    });

    win.on("closed", options.onClose);

    if (openDevTools) {
      win.webContents.openDevTools({ mode: "detach" });
    }

    setTimeout(() => onOpen(win), openDevTools ? 1000 : 0);
  });
