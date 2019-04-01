/* eslint-disable no-console */
const process = require("process");
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");

app &&
  app.on("ready", async () => {
    if (process.env.IGNORE_CERTIFICATE_ERRORS) {
      app.on(
        "certificate-error",
        (event, webContents, url, error, certificate, callback) => {
          // On certificate error we disable default behaviour (stop loading the page)
          // and we then say "it is all fine - true" to the callback
          event.preventDefault();
          callback(true);
        }
      );
    }

    await openWindow(pullApp());
    app.exit(0);
  });

module.exports = {
  command: "pull",
  describe: "pulls a local copy of the site",
  builder: args =>
    args
      .option("force", { describe: "force pull", type: "boolean" })
      .option("C", { describe: "path", type: "string" })
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean"
      }),
  handler: args =>
    launch(__filename, {
      cwd: args.C,
      env: { ...process.env, IGNORE_CERTIFICATE_ERRORS: args.ignoreCertificate }
    })
};
