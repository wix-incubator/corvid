/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const process = require("process");
const { app } = require("electron");
const localFakeEditor = require("@wix/fake-local-mode-editor");
const localServerTestKit = require("@wix/wix-code-local-server-testkit");
localServerTestKit.init();

const {
  startInCloneMode,
  startInEditMode
} = require("@wix/wix-code-local-server/src/server");
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
      server,
      port: localServerPort,
      close: closeLocalServer
    } = await (process.argv[2] === "edit"
      ? startInEditMode(localSitePath)
      : startInCloneMode(localSitePath));
    win.on("page-title-updated", (event, title) => {
      if (title === "Fake local editor") {
        console.log("fake editor loaded");
      }
    });

    setTimeout(() => server.emit("clone-complete", ""), 1000);

    return pullApp(wixCodeConfig, localServerPort, closeLocalServer, {
      useSsl: false
    })(win);
  });
});
