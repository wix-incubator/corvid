const { app } = require("electron");
const { openWindow } = require("../utils/electron");

app.on("ready", async () => {
  const win = openWindow({ show: false });
  await win.webContents.session.clearStorageData();

  win.close();
});
