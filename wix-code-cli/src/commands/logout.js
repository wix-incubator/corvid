/* eslint-disable no-console */
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");

app &&
  app.on("ready", async () => {
    try {
      openWindow({ show: false }).then(win => {
        win.webContents.session.clearStorageData();
        win.close();
      });
    } catch (exc) {
      console.log(exc);
      process.exit(-1);
    }
  });

module.exports = {
  command: "logout",
  describe: "logout from www.wix.com",
  handler: () => launch(__filename)
};
