/* eslint-disable no-console */
const process = require("process");

function handleCommandResult(commandRunner) {
  return async args => {
    const result = await commandRunner(args);
    result.matchWith({
      Error: ({ value: [code, reason] }) => {
        console.error(reason);
        process.exit(code);
      },
      Ok: () => {
        process.exit(0);
      }
    });
  };
}

module.exports = handleCommandResult;
