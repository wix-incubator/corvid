/* eslint-disable no-console */
const chalk = require("chalk");
const { app, BrowserWindow } = require("electron");
const _ = require("lodash");
const { launch } = require("../utils/electron");
const createSpinner = require("../utils/spinner");

const mySitesUrl = "https://www.wix.com/account/sites";
const signInHostname = "users.wix.com";

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
                JSON.stringify(
                  { msg: "authCookie", cookie: cookies[0] },
                  null,
                  2
                )
              );
            }
          );
          win.webContents.on("did-finish-load", () => process.exit(0));
        }
      });

      win.loadURL(mySitesUrl);
    } catch (exc) {
      console.log(exc);
      process.exit(-1);
    }
  });

async function loginCommand(spinner) {
  spinner.start(chalk.grey("Accessing www.wix.com"));

  return launch(
    __filename,
    {},
    {
      authenticatingUser: () => {
        spinner.start(chalk.grey("Authenticating on www.wix.com"));
      },
      userAuthenticated: () => {
        spinner.start(chalk.grey("Authenticated on www.wix.com"));
      }
    }
  ).then(messages => {
    const cookieMessages = messages
      ? messages.filter(({ msg }) => msg === "authCookie")
      : [];
    return _.get(cookieMessages, [0, "cookie"]);
  });
}

module.exports = {
  command: "login",
  describe: "login to www.wix.com",
  handler: async () => {
    const spinner = createSpinner();
    return loginCommand(spinner)
      .then(cookie => {
        if (!cookie) {
          throw new Error("Login failed");
        }
        spinner.succeed();
      })
      .catch(() => spinner.fail());
  },
  login: loginCommand
};
