/* eslint-disable no-console */
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");

app &&
  app.on("ready", async () => {
    await openWindow(pullApp(), { show: false });
  });

module.exports = {
  command: "pull",
  describe: "pulls a local copy of the site",
  builder: args =>
    args
      .option("force", { describe: "force pull", type: "boolean" })
      .option("C", { describe: "path", type: "string" }),
  handler: args => launch(__filename, { cwd: args.C })
};
