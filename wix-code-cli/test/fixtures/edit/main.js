/* eslint-disable no-console */
const process = require("process");
const { app } = require("electron");
const {
  server: localFakeEditorServer
} = require("@wix/fake-local-mode-editor");
const { openWindow } = require("../../../src/utils/electron");
const openEditorApp = require("../../../src/apps/open-editor");

app.on("ready", () => {
  openWindow({ show: false }).then(async win => {
    const localEditorServerPort = await localFakeEditorServer.start();
    process.env.WIXCODE_CLI_WIX_DOMAIN = `localhost:${localEditorServerPort}`;
    console.log("local editor served on: ", localEditorServerPort);

    try {
      win.on("page-title-updated", (event, title) => {
        if (title === "Fake local editor") {
          console.log("fake editor loaded");
        }
      });

      setTimeout(() => win.close(), 1000);

      return await openEditorApp({ useSsl: false })(win);
    } catch (exc) {
      console.error(exc);
      process.exit(-1);
    }
  });
});
