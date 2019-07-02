/* eslint-disable no-console */
const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const { URL } = require("url");
const { app, BrowserWindow } = require("electron");
const _ = require("lodash");
const { launch } = require("../utils/electron");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const getMessage = require("../messages");
const logger = require("corvid-local-logger");
const { exitWithError, exitWithSuccess } = require("../utils/exitProcess");

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
          win.webContents.on("did-finish-load", () => exitWithSuccess());
        }
      });
      win.loadURL(mySitesUrl);
    } catch (exc) {
      exitWithError(exc);
    }
  });

function parseSessionCookie(cookie) {
  try {
    const cookieData = jwt.decode(cookie.value.slice(4)).data;
    const parsedSession = JSON.parse(cookieData);
    return parsedSession;
  } catch (_) {
    return {};
  }
}

async function loginCommand(spinner, args = {}) {
  const loginArgs = [];
  if (args.remoteDebuggingPort) {
    loginArgs.push(`--remote-debugging-port=${args.remoteDebuggingPort}`);
  }
  spinner.start(chalk.grey(getMessage("Login_Command_Accessing")));

  return launch(
    __filename,
    {},
    {
      authenticatingUser: () => {
        spinner.start(chalk.grey(getMessage("Login_Command_Authenticating")));
      },
      userAuthenticated: () => {
        spinner.start(chalk.grey(getMessage("Login_Command_Authenticated")));
      }
    },
    loginArgs
  ).then(async messages => {
    const cookieMessages = messages
      ? messages.filter(({ msg }) => msg === "authCookie")
      : [];
    const authCookie = _.get(cookieMessages, [0, "cookie"]);
    const userGuid = parseSessionCookie(authCookie).userGuid;
    logger.setUserId(userGuid);
    await sessionData.set({ uuid: userGuid });

    return authCookie;
  });
}

module.exports = {
  command: "login",
  describe: getMessage("Login_Command_Description"),
  handler: async args => {
    const spinner = createSpinner();
    return loginCommand(spinner, args)
      .then(cookie => {
        if (!cookie) {
          throw new logger.UserError(
            getMessage("Login_Command_Login_Failed_Error")
          );
        }
        spinner.succeed();
      })
      .catch(error => {
        spinner.fail();
        throw error;
      });
  },
  login: loginCommand,
  parseSessionCookie
};
