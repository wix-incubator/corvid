const execa = require("execa");

module.exports = () => {
  const clone = async ({ editorUrl }) =>
    await execa.shellSync(`npx corvid clone ${editorUrl}`);

  const openEditor = ({ remoteDebuggingPort }) =>
    execa.shell(
      `npx corvid open-editor --remote-debugging-port=${remoteDebuggingPort}`
    ).pid;

  return {
    clone,
    openEditor
  };
};
