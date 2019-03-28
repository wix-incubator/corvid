/* eslint-disable no-console */
const { app, BrowserWindow } = require("electron");
const chalk = require("chalk");
const { launch } = require("../utils/electron");

const mySitesUrl = "https://www.wix.com/account/sites";

app &&
  app.on("ready", async () => {
    try {
      const win = new BrowserWindow({
        width: 1280,
        height: 960,
        show: false,
        webPreferences: { nodeIntegration: false }
      });

      win.webContents.on("did-navigate", (event, url) => {
        if (url === mySitesUrl) {
          win.webContents.session.cookies.get(
            { url: "http://wix.com", name: "wixSession2" },
            (error, cookies) => {
              console.log(
                JSON.stringify(
                  { msg: "authCookie", cookie: cookies[0] },
                  null,
                  2
                )
              );
            }
          );
          console.log(chalk.green("User logged in"));
          win.webContents.on("did-finish-load", () => process.exit(0));
        } else {
          win.show();
        }
      });

      win.loadURL(mySitesUrl);
    } catch (exc) {
      console.log(exc);
      process.exit(-1);
    }
  });

module.exports = {
  command: "login",
  describe: "login to www.wix.com",
  handler: () => launch(__filename)
};
