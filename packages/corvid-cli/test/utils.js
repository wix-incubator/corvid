const childProcess = require("child_process");
const path = require("path");
const electron = require("electron");
const { initTempDir } = require("corvid-local-test-utils");
const { readDirToJson } = require("corvid-dir-as-json");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");

function runFixture(name, site, ...args) {
  return new Promise(async resolve => {
    const stderr = [];
    const stdout = [];

    const fixtureDir = path.resolve(
      path.join(__dirname, "fixtures", name, site)
    );

    const tempWorkingDir = await initTempDir(await readDirToJson(fixtureDir));

    const localEditorServerPort = await localFakeEditorServer.start();
    process.env.CORVID_CLI_WIX_DOMAIN = `localhost:${localEditorServerPort}`;
    process.env.DISABLE_SSL = true;

    const arguments_ = [
      path.resolve(path.join(__dirname, "..", "src", "commands", name)),
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

    child.on("exit", code => {
      localFakeEditorServer.killAllRunningServers();
      resolve([code, stdout, stderr]);
    });

    setTimeout(() => child.kill(), 4000);
  });
}

module.exports = {
  runFixture
};
