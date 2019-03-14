const path = require("path");
const childProcess = require("child_process");

async function clone() {
  childProcess.spawn("electron", [
    path.resolve(path.join(__dirname, "..", "apps", "clone.js"))
  ]);
}

module.exports = {
  command: "clone",
  describe: "clones the site",
  handler: clone
};
