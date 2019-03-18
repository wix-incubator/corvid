/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { app } = require("electron");
const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow } = require("../utils/electron");
const cloneApp = require("../apps/clone");

async function clone(args) {
  const workingDirectory = path.resolve(args.C || process.cwd());
  const cp = childProcess.spawn(
    path.resolve(
      path.join(__dirname, "..", "..", "node_modules", ".bin", "electron")
    ),
    [path.resolve(path.join(__filename))],
    {
      cwd: workingDirectory
    }
  );

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

      const {
        port: localServerPort,
        close: closeLocalServer
      } = await startInCloneMode();
      openWindow({ show: false }).then(
        cloneApp(wixCodeConfig, localServerPort, closeLocalServer)
      );
    } catch (exc) {
      console.error(exc);
      process.exit(-1);
    }
  });

module.exports = {
  command: "clone",
  describe: "clones the site",
  builder: args => args.option("C", { describe: "path", type: "string" }),
  handler: clone
};
