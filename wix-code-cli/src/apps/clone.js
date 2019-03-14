/* eslint-disable no-console */
const process = require("process");
const path = require("path");
const fs = require("fs");
const client = require("socket.io-client");
const { spawn: spawnLocalServer } = require("@wix/wix-code-local-server");
const inElectron = require("../utils/electron");

const editorUrl = (baseDomain, metasiteId, serverEditorPort) =>
  `https://${baseDomain}/editor/${metasiteId}?localServerPort=${serverEditorPort}`;

const wixCodeConfig = JSON.parse(
  fs.readFileSync(path.join(".", ".wixcoderc.json"))
);

const localServerPort = spawnLocalServer();

inElectron(win => {
  const clnt = client(`http://localhost:${localServerPort}`);

  clnt.on("status", ({ connected, editorPort }) => {
    if (connected) {
      console.log(`The local Wix Code server is already connected to a local editor. If you are in
an editing session, please close it before trying to run this command again.`);
      process.exit(-1);
    }

    if (!editorPort) {
      console.log("local server did not return an editor port");
      process.exit(-1);
    }

    win.loadURL(
      editorUrl(
        process.env.WIXCODE_CLI_WIX_DOMAIN || "www.wix.com",
        wixCodeConfig.metasiteId,
        editorPort
      )
    );
  });
});
