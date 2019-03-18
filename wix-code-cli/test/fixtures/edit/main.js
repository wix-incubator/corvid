/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const localFakeEditor = require("@wix/fake-local-mode-editor");
const localServerTestKit = require("@wix/wix-code-local-server-testkit");
localServerTestKit.init();

const { startInEditMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow } = require("../../../src/utils/electron");
const pullApp = require("../../../src/apps/pull");

const wixCodeConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, ".wixcoderc.json"))
);

app.on("ready", () => {
  openWindow({ show: false }).then(async win => {
    const localEditorServerPort = await localFakeEditor.start();
    process.env.WIXCODE_CLI_WIX_DOMAIN = `localhost:${localEditorServerPort}`;
    console.log("local editor served on: ", localEditorServerPort);

    localServerTestKit.setServerHandler(sio => {
      sio.on("connection", () => {
        console.log("local server connection established");
      });
    });

    const {
      port: localServerPort,
      close: closeLocalServer
    } = await startInEditMode();
    win.on("page-title-updated", (event, title) => {
      if (title === "Fake local editor") {
        console.log("fake editor loaded");
        win.close();
      }
    });

    return pullApp(wixCodeConfig, localServerPort, closeLocalServer, {
      useSsl: false
    })(win);
  });
});
