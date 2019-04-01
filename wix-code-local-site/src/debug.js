const { name: moduleName } = require("../package.json");
const debug = require("debug")(moduleName);
module.exports = {
  log: (message, ...rest) => debug(`${message}`, ...rest),
  error: (message, ...rest) => debug(`ERROR: ${message}`, ...rest)
};
