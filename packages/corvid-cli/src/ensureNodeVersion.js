"use strict";

const minNodeVersion = 10;

const checkVersion = function() {
  const nodeVersion = process.versions.node;
  const major = nodeVersion.split(".")[0];

  return major >= minNodeVersion;
};

module.exports = function() {
  if (!checkVersion()) {
    // eslint-disable-next-line no-console
    console.error(
      `Unsupported Node.js version, please use version ${minNodeVersion} or higher`
    );
    process.exit(1);
  }
};
