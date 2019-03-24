/* eslint-disable no-console */
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const openEditorApp = require("../apps/open-editor");

app &&
  app.on("ready", async () => {
    await openWindow(openEditorApp(), { show: true });
  });

module.exports = {
  command: "open-editor",
  describe: "launches the local editor to edit the local site",
  builder: args => args.option("C", { describe: "path", type: "string" }),
  handler: args =>
    launch(__filename, { detached: true, stdio: "ignore", cwd: args.C })
};
