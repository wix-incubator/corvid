/* eslint-disable no-console */
const chalk = require("chalk");
const { app, BrowserWindow } = require("electron");
const { launch } = require("../utils/electron");

app &&
  app.on("ready", async () => {
    try {
      const win = new BrowserWindow({
        width: 1280,
        height: 960,
        show: false,
        webPreferences: { nodeIntegration: false }
      });

      await new Promise(resolve => {
        win.webContents.session.clearStorageData(() => {
          console.log(chalk.green("Cleared offline data"));
          resolve();
        });
      });

      win.close();
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
