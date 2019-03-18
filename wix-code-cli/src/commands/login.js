/* eslint-disable no-console */
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");

const businessManagerUserUrl = "https://www.wix.com/_api/business-manager/user";

app &&
  app.on("ready", async () => {
    try {
      openWindow({ show: false }).then(win => {
        win.webContents.on("did-navigate", (event, url) => {
          if (url === businessManagerUserUrl) {
            console.log("user logged in");
            win.webContents.on("did-finish-load", () => process.exit(0));
          } else {
            win.show();
          }
        });
        win.loadURL(businessManagerUserUrl);
      });
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
