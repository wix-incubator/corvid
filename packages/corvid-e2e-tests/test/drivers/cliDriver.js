const execa = require("execa");
const which = require("npm-which")(__dirname);
const connectToLocalEditor = require("./connectToLocalEditor");
const { findFreePort, getCorvidTestUser } = require("./utils");
const CORVID_BIN_PATH = which.sync("corvid");

const createCommandsDrvier = ({ cwd }) => {
  const parseCommandArgs = ({ remoteDebuggingPort } = {}) =>
    remoteDebuggingPort ? `--remote-debugging-port=${remoteDebuggingPort}` : "";

  const login = ({ remoteDebuggingPort } = {}) => {
    const query = parseCommandArgs({ remoteDebuggingPort });
    return execa.shell(`${CORVID_BIN_PATH} login ${query}`, { cwd });
  };

  const logout = () => execa.shell(`${CORVID_BIN_PATH} logout`, { cwd });

  const clone = ({ editorUrl, remoteDebuggingPort } = {}) => {
    const query = parseCommandArgs({ remoteDebuggingPort });
    return execa.shell(`${CORVID_BIN_PATH} clone ${query} "${editorUrl}"`, {
      cwd
    });
  };

  const openEditor = ({ remoteDebuggingPort } = {}) => {
    const query = parseCommandArgs({ remoteDebuggingPort });
    return execa.shell(`${CORVID_BIN_PATH} open-editor ${query}`, { cwd });
  };

  return {
    login,
    logout,
    clone,
    openEditor
  };
};

module.exports = (...args) => {
  const commands = createCommandsDrvier(args);

  const isLoggedIn = async () => {
    const loginDebugPort = await findFreePort();
    const loginCommand = commands.login({
      remoteDebuggingPort: loginDebugPort
    });
    const loginEditorDriver = await connectToLocalEditor(loginDebugPort);
    console.log("login connected"); //eslint-disable-line

    try {
      await loginEditorDriver.waitForLoginForm();
      await loginEditorDriver.close();
      return false;
    } catch (e) {
      await loginCommand;
      return true;
    }
  };

  const performLogout = async () => await commands.logout();

  const performLogin = async () => {
    const loginDebugPort = await findFreePort();
    const loginCommand = commands.login({
      remoteDebuggingPort: loginDebugPort
    });

    const loginEditorDriver = await connectToLocalEditor(loginDebugPort);
    console.log("login connected"); //eslint-disable-line

    await loginEditorDriver.waitForLoginForm();
    await loginEditorDriver.login(getCorvidTestUser());
    await loginCommand;
  };

  return {
    commands,
    performLogout,
    performLogin,
    isLoggedIn
  };
};
