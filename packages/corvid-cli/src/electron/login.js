/* eslint-disable no-console */
const { URL } = require("url");
const { app, BrowserWindow } = require("electron");
const { openWindow } = require("../utils/electron");

const mySitesUrl = "https://www.wix.com/account/sites";
const signInHostname = "users.wix.com";

app.on("ready", async () => {
  const win = openWindow({ show: false });

  win.webContents.on("did-navigate", (event, url) => {
    const parsed = new URL(url);
    if (parsed.hostname === signInHostname) {
      console.log(JSON.stringify({ event: "authenticatingUser" }));
      win.show();
    } else if (url === mySitesUrl) {
      console.log(JSON.stringify({ event: "userAuthenticated" }));
      win.hide();
      win.webContents.session.cookies.get(
        { name: "wixSession2" },
        (error, cookies) => {
          if (error) {
            throw error;
          }
          console.log(
            JSON.stringify({ msg: "authCookie", cookie: cookies[0] }, null, 2)
          );
          app.quit();
        }
      );
    }
  });
  win.loadURL(mySitesUrl);

  let userAgent = win.webContents
    .getUserAgent()
    .replace("Electron/" + process.versions.electron, "");

  win.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options) => {
      event.preventDefault();
      const newWin = new BrowserWindow(options);
      newWin.loadURL(url, {
        // we override the userAgent to resolve a security erorr caused by a new Google Policy. To be removed once the isue is resovled
        // https://support.google.com/accounts/thread/22873505?msgid=22873505
        userAgent
      });
      event.newGuest = newWin;
    }
  );
});
