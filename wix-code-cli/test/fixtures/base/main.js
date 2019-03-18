/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const localFakeEditor = require("@wix/fake-local-mode-editor");
const localServerTestKit = require("@wix/wix-code-local-server-testkit");
localServerTestKit.init();

const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const { openWindow } = require("../../../src/utils/electron");
const pullApp = require("../../../src/apps/pull");
const localSiteDir = require("@wix/wix-code-local-server/test/utils/localSiteDir");

const wixCodeConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, ".wixcoderc.json"))
);
const localSiteFiles = {
  public: {
    "public-file.json": "public code"
  },
  backend: {
    "sub-folder": {
      "backendFile.jsw": "backend code"
    }
  }
};

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

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const {
      port: localServerPort,
      close: closeLocalServer
    } = await startInCloneMode(localSitePath);
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
