/* eslint-disable no-console */
const process = require("process");
const client = require("socket.io-client");

const genEditorUrl = (useSsl, baseDomain, metasiteId, serverEditorPort) =>
  `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?localServerPort=${serverEditorPort}`;

module.exports = (
  wixCodeConfig,
  localServerPort,
  closeLocalServer,
  { useSsl = true }
) => async win => {
  const clnt = client(`http://localhost:${localServerPort}`);
  win.on("close", closeLocalServer);

  clnt.on("status", ({ connected, localServerEditorPort }) => {
    if (connected) {
      console.log(`The local Wix Code server is already connected to a local editor. If you are in
an editing session, please close it before trying to run this command again.`);
      closeLocalServer();
      process.exit(-1);
    }

    if (!localServerEditorPort) {
      console.log("local server did not return an editor port");
      closeLocalServer();
      process.exit(-1);
    }

    const editorUrl = genEditorUrl(
      useSsl,
      process.env.WIXCODE_CLI_WIX_DOMAIN || "www.wix.com",
      wixCodeConfig.metasiteId,
      localServerEditorPort
    );

    console.log(editorUrl);
    win.loadURL(editorUrl);
  });
};
