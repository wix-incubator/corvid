"use strict";

module.exports = {
  required: "version 8 or higher",
  check: () => {
    const nodeVersion = process.versions.node;
    // eslint-disable-next-line no-unused-vars
    const [major] = nodeVersion.split(".");

    return major >= 8;
  }
};
