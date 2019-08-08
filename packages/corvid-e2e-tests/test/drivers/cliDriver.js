const execa = require("execa");
const which = require("npm-which")(__dirname);
const { findFreePort } = require("./utils");
const CORVID_BIN_PATH = which.sync("corvid");

module.exports = ({ cwd }) => {
  const parseCommandArgs = ({ remoteDebuggingPort } = {}) =>
    remoteDebuggingPort ? `--remote-debugging-port=${remoteDebuggingPort}` : "";

  const withCommand = async (
    commandName,
    { editorUrl, remoteDebuggingPort }
  ) => {
    const port = remoteDebuggingPort || (await findFreePort());
    const query = parseCommandArgs({ remoteDebuggingPort: port });
    const url = editorUrl ? editorUrl : "";
    const command = execa.shell(
      `${CORVID_BIN_PATH} ${commandName} ${query} ${url}`,
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
