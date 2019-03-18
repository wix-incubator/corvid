/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { startInEditMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow, launch } = require("../utils/electron");
const openEditorApp = require("../apps/open-editor");

app &&
  app.on("ready", async () => {
    try {
      const wixCodeConfig = JSON.parse(
        fs.readFileSync(path.join(".", ".wixcoderc.json"))
      );

      const {
        port: localServerPort,
        close: closeLocalServer
      } = await startInEditMode();
      openWindow({ show: true }).then(
        openEditorApp(wixCodeConfig, localServerPort, closeLocalServer)
      );
    } catch (exc) {
      console.error(exc);
      process.exit(-1);
    }
  });

module.exports = {
  command: "open-editor",
  describe: "launches the local editor to edit the local site",
  builder: args => args.option("C", { describe: "path", type: "string" }),
  handler: () => launch(__filename, { detached: true, stdio: "ignore" })
};
