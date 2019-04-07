"use strict";

module.exports = {
  required: "version 10 or higher",
  check: () => {
    const nodeVersion = process.versions.node;
    // eslint-disable-next-line no-unused-vars
    const [major, minor, patch] = nodeVersion.split(".");

    return (major === 10 && minor >= 10) || major > 10;
  }
};
