/* eslint-disable no-console */
const path = require("path");
const childProcess = require("child_process");
const { app } = require("electron");
const { openWindow } = require("../utils/electron");

const businessManagerUserUrl = "https://www.wix.com/_api/business-manager/user";

async function login() {
  const cp = childProcess.spawn(
    path.resolve(
      path.join(__dirname, "..", "..", "node_modules", ".bin", "electron")
    ),
    [path.resolve(path.join(__filename))]
  );

  cp.stdout.on("data", function(data) {
    console.log(data.toString());
  });

  cp.stderr.on("data", function(data) {
    console.error(data.toString());
  });
}

app &&
  app.on("ready", async () => {
    try {
      openWindow().then(win => {
        win.webContents.on("did-navigate", (event, url) => {
          if (url === businessManagerUserUrl) {
            console.log("user logged in");
            win.webContents.on("did-finish-load", () => process.exit(0));
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
  handler: login
};
