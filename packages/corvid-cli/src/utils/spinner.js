"use strict";
/* eslint-disable */

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
    start: msg => console.log("[start]", msg), //spinner.start.bind(spinner),
    succeed: msg => console.log("[succeed]", msg), //spinner.succeed.bind(spinner),
    stop: msg => console.log("[stop]", msg), //ifSpinning(spinner.stop.bind(spinner)),
    fail: msg => console.log("[fail]", msg) //ifSpinning(spinner.fail.bind(spinner))
  };
};
