const childProcess = require("child_process");
const path = require("path");

function runFixture(name, site, ...args) {
  return new Promise(resolve => {
    const stderr = [];
    const stdout = [];

    const wd = path.resolve(path.join(__dirname, "fixtures", name, site));
    const arguments_ = [
      path.resolve(path.join(__dirname, "fixtures", name, "main.js")),
      ...args
    ];
    const child = childProcess.spawn("electron", arguments_, {
      cwd: wd,
      env: { ...process.env, FORCE_COLOR: "yes" }
    });

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
