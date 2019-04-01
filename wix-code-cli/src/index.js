#!/usr/bin/env node
require("./monitoring/initSentry");
const chalk = require("chalk");

// eslint-disable-next-line no-console
console.log(chalk.yellow("Corvid Technical Preview"));
require("yargs")
  .usage("Usage: $0 <command> [options]")
  .commandDir("commands")
  .help("help")
  .demandCommand().argv;
