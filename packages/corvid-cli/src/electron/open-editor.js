const process = require("process");
const { app } = require("electron");
const { openWindow } = require("../utils/electron");
const openEditorApp = require("../apps/open-editor");

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

  await openWindow(openEditorApp(), {
    show: true && !process.env.CORVID_FORCE_HEADLESS
  });
});
