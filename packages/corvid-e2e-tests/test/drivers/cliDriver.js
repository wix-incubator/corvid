const execa = require("execa");
const which = require("npm-which")(__dirname);
const { findFreePort } = require("./utils");
const CORVID_BIN_PATH = which.sync("corvid");
const parseArgs = require("minimist");
const { extraParams } = parseArgs(process.argv.slice(2));

module.exports = ({ cwd }) => {
  const parseCommandArgs = ({ remoteDebuggingPort }) =>
    remoteDebuggingPort ? `--remote-debugging-port=${remoteDebuggingPort}` : "";

  const withCommand = async (
    commandName,
    { editorUrl, remoteDebuggingPort, env = {} }
  ) => {
    let output = "";
    const port = remoteDebuggingPort || (await findFreePort());
    const commandArgsQuery = parseCommandArgs({ remoteDebuggingPort: port });
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

  return {
    login,
    logout,
    clone,
    openEditor
  };
};
