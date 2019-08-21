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
    { editorUrl, remoteDebuggingPort }
  ) => {
    const port = remoteDebuggingPort || (await findFreePort());
    const commandArgsQuery = parseCommandArgs({ remoteDebuggingPort: port });
    const extraParamsQuery = extraParams ? `QUERY="${extraParams}"` : "";
    const url = editorUrl ? editorUrl : "";
    const command = execa.shell(
      `${extraParamsQuery} ${CORVID_BIN_PATH} ${commandName} ${commandArgsQuery} ${url}`,
      {
        cwd
      }
    );
    return {
      editorDebugPort: port,
      waitForCommandToEnd: () => command,
      kill: async () => await command.kill()
    };
  };

  const login = async ({ remoteDebuggingPort } = {}) =>
    withCommand("login", { remoteDebuggingPort });

  const logout = async ({ remoteDebuggingPort } = {}) =>
    withCommand("logout", { remoteDebuggingPort });

  const clone = async ({ editorUrl, remoteDebuggingPort } = {}) =>
    withCommand("clone", { editorUrl, remoteDebuggingPort });

  const openEditor = async ({ remoteDebuggingPort } = {}) =>
    withCommand("open-editor", { remoteDebuggingPort });

  return {
    login,
    logout,
    clone,
    openEditor
  };
};
