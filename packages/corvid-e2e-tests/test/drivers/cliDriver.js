const execa = require("execa");
const which = require("npm-which")(__dirname);
const { findFreePort } = require("./utils");
const CORVID_BIN_PATH = which.sync("corvid");
const parseArgs = require("minimist");
const { extraParams } = parseArgs(process.argv.slice(2));

module.exports = ({ cwd }) => {
  const executedCommands = [];

  const executeCommand = async (commandName, { env = {}, args = "" } = {}) => {
    let output = "";
    const remoteDebugPort = await findFreePort();
    if (extraParams) {
      env["QUERY"] = `"${extraParams}"`;
    }
    const command = execa.command(
      `${CORVID_BIN_PATH} ${commandName} ${args} --remote-debugging-port=${remoteDebugPort}`,
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
      editorDebugPort: remoteDebugPort,
      waitForCommandToEnd: () => command,
      getOutput: () => output,
      kill: async (signal, options) => await command.kill(signal, options)
    };
  };

  const login = async () => executeCommand("login");

  const logout = async () => executeCommand("logout");

  const clone = async ({ editorUrl }) =>
    executeCommand("clone", { args: editorUrl });

  const openEditor = async ({ env } = {}) =>
    executeCommand("open-editor", { env });

  const killAll = async (signal, options) =>
    Promise.all(executedCommands.map(command => command.kill(signal, options)));

  return {
    login,
    logout,
    clone,
    openEditor,
    killAll
  };
};
