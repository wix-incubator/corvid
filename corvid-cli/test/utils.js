const childProcess = require("child_process");
const path = require("path");
const electron = require("electron");
const { initTempDir } = require("corvid-local-test-utils");
const { readDirToJson } = require("corvid-dir-as-json");

function runFixture(name, site, ...args) {
  return new Promise(async resolve => {
    const stderr = [];
    const stdout = [];

    const fixtureDir = path.resolve(
      path.join(__dirname, "fixtures", name, site)
    );

    const tempWorkingDir = await initTempDir(await readDirToJson(fixtureDir));

    const arguments_ = [
      path.resolve(path.join(__dirname, "fixtures", name, "main.js")),
      ...args
    ];
    const child = childProcess.spawn(electron, arguments_, {
      cwd: tempWorkingDir,
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
