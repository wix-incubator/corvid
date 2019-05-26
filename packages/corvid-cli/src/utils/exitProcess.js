const chalk = require("chalk");
const hasAnsi = require("has-ansi");
const { logger, UserError } = require("corvid-local-logger");

const colorRedIfNotYetColored = message =>
  message && hasAnsi(message) ? message : chalk.red(message);

const exitWithError = error => {
  if (error instanceof UserError) {
    const coloredErrorMessage = colorRedIfNotYetColored(error.message);
    console.log(coloredErrorMessage); // eslint-disable-line no-console
  } else {
    logger.error(error);
  }
  logger.close().then(() => {
    process.exit(1);
  });
};

const exitWithSuccess = message => {
  if (message) {
    console.log(chalk.green(message)); // eslint-disable-line no-console
  }
  process.exit(0);
};

module.exports = {
  exitWithError,
  exitWithSuccess
};
