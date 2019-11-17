const { app, BrowserWindow } = require("electron");

app.on("ready", async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    show: false,
    webPreferences: { nodeIntegration: false }
  });
  await new Promise(resolve => {
    win.webContents.session.clearStorageData(() => {
      resolve();
    });
  });

  win.close();
});
