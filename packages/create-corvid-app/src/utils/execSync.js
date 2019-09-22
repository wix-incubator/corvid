const execSync = require("child_process").execSync;
const path = require("path");

const executeSync = (cwd, cmd, { stdio } = {}) =>
  execSync(cmd, {
    stdio: stdio || "inherit",
    cwd: path.resolve(cwd)
  });

module.exports = executeSync;
