"use strict";

const ora = require("ora");

module.exports = msg => {
  const spinner = ora({ text: msg, spinner: "dots11", stream: process.stdout });

  return spinner;
};
