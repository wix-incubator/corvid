const { app } = require("electron");
const { openWindow } = require("../utils/electron");

app.on("ready", async () => {
  const win = openWindow({ show: false });
  await new Promise(resolve => {
    win.webContents.session.clearStorageData(() => {
      resolve();
    });
  });

  win.close();
});
