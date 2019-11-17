const process = require("process");
const { app } = require("electron");
const yargs = require("yargs");
const { openWindow } = require("../utils/electron");
const pullApp = require("../apps/pull");

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

  const args = yargs.argv;
  await openWindow(pullApp({ override: args.override, move: args.move }));
});
