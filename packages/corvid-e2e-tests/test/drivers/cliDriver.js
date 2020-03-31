const execa = require("execa");
const which = require("npm-which")(__dirname);
const { findFreePort } = require("./utils");
const CORVID_BIN_PATH = which.sync("corvid");
const parseArgs = require("minimist");
const { extraParams } = parseArgs(process.argv.slice(2));
const fetch = require("node-fetch");

module.exports = ({ cwd }) => {
  const executedCommands = [];

  const parseCommandArgs = ({ remoteDebuggingPort }, args) =>
    args + " " + remoteDebuggingPort
      ? `--remote-debugging-port=${remoteDebuggingPort}`
      : "";

  const withCommand = async (
    commandName,
    { editorUrl, remoteDebuggingPort, env = {}, args = "" }
  ) => {
    let output = "";
    const port = remoteDebuggingPort || (await findFreePort());
    const commandArgsQuery = parseCommandArgs(
      { remoteDebuggingPort: port },
      args
    );
    if (extraParams) {
      env["QUERY"] = `"${extraParams}"`;
    }
    const url = editorUrl ? editorUrl : "";
    const command = execa.command(
      `${CORVID_BIN_PATH} ${commandName} ${commandArgsQuery} ${url}`,
      {
        cwd,
        env
      }
    );
    command.stdout.on("data", function(data) {
      output += data.toString();
    });
    command.stderr.on("data", function(error) {
      output += error.toString();
    });
    executedCommands.push(command);
    return {
      editorDebugPort: port,
      waitForCommandToEnd: () => command,
      getOutput: () => output,
      kill: async (signal, options) => await command.kill(signal, options)
    };
  };

  const login = async ({ remoteDebuggingPort } = {}) =>
    withCommand("login", { remoteDebuggingPort });

  const logout = async ({ remoteDebuggingPort } = {}) =>
    withCommand("logout", { remoteDebuggingPort });

  const clone = async ({ editorUrl, remoteDebuggingPort } = {}) =>
    withCommand("clone", { editorUrl, remoteDebuggingPort });

  const openEditor = async ({ remoteDebuggingPort, env } = {}) =>
    withCommand("open-editor", { remoteDebuggingPort, env });

  const hackLogin = async () => {
    const getTestUserCookies = () =>
      fetch("https://apps.wix.com/_api/sled-api/users/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SLED_API_TOKEN}`
        },
        body: JSON.stringify({ userEmail: "corvidtest@gmail.com" })
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          console.log("test user data:", data);
          return [
            ...data.cookies.map(cookie => ({
              url: "http://wix.com",
              name: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path,
              isSecure: cookie.secure,
              httpOnly: cookie.isHttpOnly,
              expirationDate: cookie.expires || Date.now() + 60 * 60 * 1000
            }))
          ];
        });

    const cookies = await getTestUserCookies();
    return withCommand("store-cookies", {
      args: `--cookies=${JSON.stringify(cookies)}`
    });
  };

  const killAll = async (signal, options) =>
    Promise.all(executedCommands.map(command => command.kill(signal, options)));

  return {
    hackLogin,
    login,
    logout,
    clone,
    openEditor,
    killAll
  };
};
