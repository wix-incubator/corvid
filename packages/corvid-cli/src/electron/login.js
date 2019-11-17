/* eslint-disable no-console */
const { URL } = require("url");
const { app, BrowserWindow } = require("electron");

const mySitesUrl = "https://www.wix.com/account/sites";
const signInHostname = "users.wix.com";

app.on("ready", async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 960,
    show: false,
    webPreferences: { nodeIntegration: false }
  });

  win.webContents.on("did-navigate", (event, url) => {
    const parsed = new URL(url);
    if (parsed.hostname === signInHostname) {
      console.log(JSON.stringify({ event: "authenticatingUser" }));
      win.show();
    } else if (url === mySitesUrl) {
      console.log(JSON.stringify({ event: "userAuthenticated" }));
      win.hide();

      win.webContents.session.cookies.get(
        { url: "http://wix.com", name: "wixSession2" },
        (error, cookies) => {
          if (error) {
            throw error;
          }

          console.log(
            JSON.stringify({ msg: "authCookie", cookie: cookies[0] }, null, 2)
          );
        }
      );
      win.webContents.on("did-finish-load", () => app.quit());
    }
  });
  win.loadURL(mySitesUrl);
});
