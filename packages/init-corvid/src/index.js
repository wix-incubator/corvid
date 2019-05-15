#!/usr/bin/env node

var chalk = require("chalk");

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split(".");
var major = semver[0];

const requiredVersion = 8;

if (major < requiredVersion) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.red(
      `Unsupported Node.js version, please use version ${requiredVersion} or higher.`
    )
  );
  process.exit(1);
}

require("./initCorvid");
