/* eslint-disable no-console */
const { URL } = require("url");
const { app, BrowserWindow } = require("electron");
const { openWindow } = require("../utils/electron");

const mySitesUrl = "https://www.wix.com/account/sites";
const signInHostname = "users.wix.com";

app.on("ready", async () => {
  const win = openWindow({ show: false });

  win.webContents.on("did-navigate", async (event, url) => {
    console.log(
      JSON.stringify({
        event: "debug",
        payload: JSON.stringify({ event: "did-navigate", url })
      })
    );
    const parsed = new URL(url);
    console.log(
      JSON.stringify({
        event: "debug",
        payload: JSON.stringify({ hostname: parsed.hostname })
      })
    );
    if (parsed.hostname === signInHostname) {
      console.log(JSON.stringify({ event: "authenticatingUser" }));
      win.show();
    } else if (url === mySitesUrl) {
      console.log(JSON.stringify({ event: "userAuthenticated" }));
      win.hide();
      // const cookies = await win.webContents.session.cookies.get({});
      // console.log(
      //   JSON.stringify({
      //     event: "debug",
      //     payload: JSON.stringify({
      //       event: "ALL COOKIES",
      //       message: JSON.stringify(cookies)
      //     })
      //   })
      // );

      win.webContents.session.cookies.get(
        { name: "wixSession2" },
        (error, cookies) => {
          console.log(
            JSON.stringify({
              event: "debug",
              payload: JSON.stringify({
                event: "COOKIES"
              })
            })
          );
          if (error) {
            throw error;
          }
          console.log(
            JSON.stringify({ msg: "authCookie", cookie: cookies[0] }, null, 2)
          );
          app.quit();
        }
      );
    } else {
      console.log(
        JSON.stringify({
          event: "debug",
          payload: "something bad happened"
        })
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
      console.log(
        JSON.stringify({
          event: "debug",
          payload: JSON.stringify({
            event: "NEW WINDOW"
          })
        })
      );
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
