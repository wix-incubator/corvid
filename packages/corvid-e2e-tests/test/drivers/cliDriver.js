const execa = require("execa");
const which = require("npm-which")(__dirname);
const { findFreePort } = require("./utils");
const CORVID_BIN_PATH = which.sync("corvid");

module.exports = ({ cwd }) => {
  const parseCommandArgs = ({ remoteDebuggingPort } = {}) =>
    remoteDebuggingPort ? `--remote-debugging-port=${remoteDebuggingPort}` : "";

  const login = async ({ remoteDebuggingPort } = {}) => {
    const port = remoteDebuggingPort || (await findFreePort());
    const query = parseCommandArgs({ remoteDebuggingPort: port });
    const command = execa.shell(`${CORVID_BIN_PATH} login ${query}`, {
      cwd
    });
    return {
      remoteDebuggingPort: port,
      waitForCommandToEnd: () => command,
      kill: async () => await command.kill()
    };
  };

  const logout = async ({ remoteDebuggingPort } = {}) => {
    const port = remoteDebuggingPort || (await findFreePort());
    const query = parseCommandArgs({ remoteDebuggingPort: port });
    const command = execa.shell(`${CORVID_BIN_PATH} logout ${query}`, { cwd });
    return {
      remoteDebuggingPort: port,
      waitForCommandToEnd: () => command,
      kill: async () => await command.kill()
    };
  };

  const clone = async ({ editorUrl, remoteDebuggingPort } = {}) => {
    const port = remoteDebuggingPort || (await findFreePort());
    const query = parseCommandArgs({ remoteDebuggingPort: port });
    const command = execa.shell(
      `${CORVID_BIN_PATH} clone ${query} "${editorUrl}"`,
      {
        cwd
      }
    );
    return {
      remoteDebuggingPort: port,
      waitForCommandToEnd: () => command,
      kill: async () => await command.kill()
    };
  };

  const openEditor = async ({ remoteDebuggingPort } = {}) => {
    const port = remoteDebuggingPort || (await findFreePort());
    const query = parseCommandArgs({ remoteDebuggingPort: port });
    const command = execa.shell(`${CORVID_BIN_PATH} open-editor ${query}`, {
      cwd
    });
    return {
      remoteDebuggingPort: port,
      waitForCommandToEnd: () => command,
      kill: async () => await command.kill()
    };
  };

  return {
    login,
    logout,
    clone,
    openEditor
  };
};
