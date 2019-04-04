/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");

function commandWrapper(commandRunner) {
  return async args => {
    commandRunner(args).then(
      msg => console.log(chalk.green(msg)),
      error => {
        console.log(chalk.red(error.message));
        process.exit(-1);
      }
    );
  };
}

module.exports = commandWrapper;
