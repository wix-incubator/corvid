const chalk = require("chalk");

const important = text => chalk.cyan(text);
const warning = text => chalk.yellow(text);
const error = text => chalk.red(text);

module.exports = {
  important,
  warning,
  error
};
