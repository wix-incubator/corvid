/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");

app &&
  app.on("ready", async () => {
    try {
      const wixCodeConfig = JSON.parse(
        fs.readFileSync(path.join(".", ".wixcoderc.json"))
      );

      const {
        adminPort: localServerPort,
        close: closeLocalServer
      } = await startInCloneMode(".");
      openWindow({ show: false }).then(
        pullApp(wixCodeConfig, localServerPort, closeLocalServer)
      );
    } catch (exc) {
      console.error(exc);
      process.exit(-1);
    }
  });

module.exports = {
  command: "pull",
  describe: "pulls a local copy of the site",
  builder: args => args.option("C", { describe: "path", type: "string" }),
  handler: args => launch(__filename, { cwd: args.C })
};
