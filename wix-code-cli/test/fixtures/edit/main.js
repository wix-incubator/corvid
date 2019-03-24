/* eslint-disable no-console */
const process = require("process");
const { app } = require("electron");
const {
  server: localFakeEditorServer
} = require("@wix/fake-local-mode-editor");
const { openWindow } = require("../../../src/utils/electron");
const openEditorApp = require("../../../src/apps/open-editor");

const testApp = {
  serverMode: "edit",
  handler: async (wixCodeConfig, win, client, localServerStatus) => {
    try {
      win.on("page-title-updated", (event, title) => {
        if (title === "Fake local editor") {
          console.log("fake editor loaded");
        }
      });

      setTimeout(() => win.close(), 4000);

      return await openEditorApp({ useSsl: false }).handler(
        wixCodeConfig,
        win,
        client,
        localServerStatus
      );
    } catch (exc) {
      console.error(exc);
      process.exit(-1);
    }
  }
};

app.on("ready", async () => {
  const localEditorServerPort = await localFakeEditorServer.start();
  process.env.WIXCODE_CLI_WIX_DOMAIN = `localhost:${localEditorServerPort}`;
  console.log("local editor served on: ", localEditorServerPort);

  await openWindow(testApp, { show: false });
});
