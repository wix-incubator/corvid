const util = require("util");
const yargs = require("yargs/yargs")(process.argv.slice(2));

const getConsoleSpyOuput = consoleSpy =>
  consoleSpy.mock.calls
    .map(consoleArgs => util.format(...consoleArgs))
    .join("\n");

const runCommand = commandName => {
  return (cwd, cliArgsStr) =>
    new Promise((resolve, reject) => {
      const consoleLogSpy = jest.spyOn(global.console, "log");
      const consoleErrorSpy = jest.spyOn(global.console, "error");
      const processExitSpy = jest.spyOn(process, "exit");

      processExitSpy.mockImplementation(exitCode => {
        const consoleLogs = getConsoleSpyOuput(consoleLogSpy);
        const consoleErrors = getConsoleSpyOuput(consoleErrorSpy);

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();

        if (exitCode === 0) {
          resolve(consoleLogs);
        } else {
          reject(new Error(consoleErrors));
        }
      });

      yargs
        .commandDir("../../src/commands")
        .demandCommand()
        .exitProcess(false)
        .help()
        .parse(`${commandName} ${cliArgsStr} --dir=${cwd}`, parseError => {
          if (parseError) {
            reject(parseError);
          }
        });
    });
};

module.exports = {
  clone: runCommand("clone"),
  pull: runCommand("pull"),
  openEditor: runCommand("open-editor")
};
