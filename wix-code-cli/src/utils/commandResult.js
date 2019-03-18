/* eslint-disable no-console */
const process = require("process");

function handleCommandResult(commandRunner) {
  return args =>
    commandRunner(args).matchWith({
      Error: (code, reason) => {
        console.error(reason);
        process.exit(code);
      },
      Ok: () => {
        process.exit(0);
      }
    });
}

module.exports = handleCommandResult;
