"use strict";

const ora = require("ora");

module.exports = msg => {
  const spinner = ora({ text: msg, spinner: "dots11", stream: process.stdout });

  const ifSpinning = callback => (...args) => {
    if (spinner.isSpinning) {
      return callback(...args);
    }
    return spinner;
  };

  return {
    start: spinner.start.bind(spinner),
    succeed: spinner.succeed.bind(spinner),
    stop: ifSpinning(spinner.stop.bind(spinner)),
    fail: ifSpinning(spinner.fail.bind(spinner))
  };
};
