/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const localFakeEditor = require("@wix/fake-local-mode-editor");
const localServerTestKit = require("@wix/wix-code-local-server-testkit");
localServerTestKit.init();

const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow } = require("../../../src/utils/electron");
const cloneApp = require("../../../src/apps/clone");

const wixCodeConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, ".wixcoderc.json"))
);

app.on("ready", () => {
  openWindow({ show: false }).then(async win => {
    const localEditorPort = await localFakeEditor.start();
    process.env.WIXCODE_CLI_WIX_DOMAIN = `localhost:${localEditorPort}`;

    console.log("local editor served on: ", localEditorPort);
    localServerTestKit.setServerHandler(sio => {
      sio.on("connection", () => {
        console.log("local server connection established");

        sio.emit("status", {
          connected: false,
          localServerEditorPort: localEditorPort
        });
      });
    });

    const {
      port: localServerPort,
      close: closeLocalServer
    } = await startInCloneMode();
    win.on("page-title-updated", () => {
      console.log("page-title-updated");
      win.close();
    });

    cloneApp(wixCodeConfig, localServerPort, closeLocalServer, {
      useSsl: false
    })(win);
  });
});
