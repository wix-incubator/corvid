/* eslint-disable no-console */
const chalk = require("chalk");
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");

app &&
  app.on("ready", async () => {
    try {
      openWindow({ show: false }).then(win => {
        win.webContents.session.clearStorageData({ storages: "cookies" });
        win.close();
      });
      console.log(chalk.green("Cookies cleared"));
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
