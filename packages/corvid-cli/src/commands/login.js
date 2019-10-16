const path = require("path");
const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const { launch } = require("../utils/electron");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const getMessage = require("../messages");
const { UserError } = require("corvid-local-logger");
const commandWithDefaults = require("../utils/commandWithDefaults");

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
    path.join(__dirname, "../electron/login"),
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
    await sessionData.set({ uuid: parseSessionCookie(authCookie).userGuid });

    return authCookie;
  });
}

module.exports = commandWithDefaults({
  command: "login",
  describe: getMessage("Login_Command_Description"),
  handler: async args => {
    const spinner = createSpinner();
    return loginCommand(spinner, args)
      .then(cookie => {
        if (!cookie) {
          throw new UserError(getMessage("Login_Command_Login_Failed_Error"));
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
});
