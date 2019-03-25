/* eslint-disable no-console */
const process = require("process");
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const openEditorApp = require("../apps/open-editor");

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

    await openWindow(openEditorApp(), { show: true });
  });

module.exports = {
  command: "open-editor",
  describe: "launches the local editor to edit the local site",
  builder: args =>
    args
      .option("C", { describe: "path", type: "string" })
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean"
      }),
  handler: args =>
    launch(__filename, {
      // TODO uncomment the following option to spawn the app in the background once the local
      // server can be spawned in the background as well
      //detached: true,
      stdio: "ignore",
      cwd: args.C,
      env: { ...process.env, IGNORE_CERTIFICATE_ERRORS: args.ignoreCertificate }
    })
};
