/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { app } = require("electron");
const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow } = require("../utils/electron");
const cloneApp = require("../apps/clone");

async function clone() {
  const cp = childProcess.spawn("electron", [
    path.resolve(path.join(__filename))
  ]);

  cp.stdout.on("data", function(data) {
    console.log(data.toString());
  });

  cp.stderr.on("data", function(data) {
    console.error(data.toString());
  });
}

app &&
  app.on("ready", async () => {
    try {
      const wixCodeConfig = JSON.parse(
        fs.readFileSync(path.join(".", ".wixcoderc.json"))
      );
      console.log(wixCodeConfig);

      const {
        port: localServerPort,
        close: closeLocalServer
      } = await startInCloneMode();
      openWindow().then(
        cloneApp(wixCodeConfig, localServerPort, closeLocalServer)
      );
    } catch (exc) {
      console.log(exc);
      process.exit(-1);
    }
  });

module.exports = {
  command: "clone",
  describe: "clones the site",
  handler: clone
};
