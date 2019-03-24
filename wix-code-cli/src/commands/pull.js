/* eslint-disable no-console */
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");

app &&
  app.on("ready", async () => {
    try {
      await openWindow({ show: false }).then(pullApp());
    } catch (exc) {
      console.error(exc);
      process.exit(-1);
    }
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
