const childProcess = require("child_process");
const path = require("path");

function runFixture(name) {
  return new Promise(resolve => {
    const stderr = [];
    const stdout = [];

    const child = childProcess.spawn("electron", [
      path.resolve(path.join(__dirname, "fixtures", name, "main.js"))
    ]);

    child.stdout.on("data", function(data) {
      stdout.push(data.toString());
    });

    child.stderr.on("data", function(data) {
      stderr.push(data.toString());
    });

    child.on("exit", code => resolve([code, stdout, stderr]));
  });
}

module.exports = {
  runFixture
};
