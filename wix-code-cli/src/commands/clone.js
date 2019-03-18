/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow, launch } = require("../utils/electron");
const cloneApp = require("../apps/clone");

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
  handler: () => launch(__filename)
};
