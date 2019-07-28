const chalk = require("chalk");
const hasAnsi = require("has-ansi");
const { killAllChildProcesses } = require("./electron");
const { logger, UserError } = require("corvid-local-logger");
const EditorError = require("./EditorError");

const colorRedIfNotYetColored = message =>
  message && hasAnsi(message) ? message : chalk.red(message);

const exitWithError = async error => {
  if (error instanceof UserError) {
    const coloredErrorMessage = colorRedIfNotYetColored(error.message);
    console.error(coloredErrorMessage); // eslint-disable-line no-console
  } else if (error instanceof EditorError) {
    logger.error(error);
    if (error.userMessage) {
      const coloredErrorMessage = colorRedIfNotYetColored(error.userMessage);
      console.error(coloredErrorMessage); // eslint-disable-line no-console
    }
  } else {
    logger.error(error);
  }

  await logger.close();
  await killAllChildProcesses();
  process.exit(1);
};

const exitWithSuccess = async message => {
  if (message) {
    console.log(chalk.green(message)); // eslint-disable-line no-console
  }
  await logger.close();
  await killAllChildProcesses();
  process.exit(0);
};

const asyncWithExit = asyncCallback => async (...args) => {
  try {
    const result = await asyncCallback(...args);
    await exitWithSuccess(result);
  } catch (error) {
    await exitWithError(error);
  }
};

module.exports = {
  exitWithError,
  exitWithSuccess,
  asyncWithExit
};
