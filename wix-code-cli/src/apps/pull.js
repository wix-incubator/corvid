/* eslint-disable no-console */
const process = require("process");
const client = require("socket.io-client");
const genEditorUrl = require("../utils/genEditorUrl");
const { sendRequest } = require("../utils/socketIoHelpers");

const signInHostname = "users.wix.com";
const editorHostname = "editor.wix.com";

module.exports = (
  wixCodeConfig,
  localServerPort,
  closeLocalServer,
  { useSsl = true } = {}
) => async win => {
  const clnt = client.connect(`http://localhost:${localServerPort}`);

  await new Promise((resolve, reject) => {
    clnt.on("connect", () => {
      console.log("Local server connection established");
      resolve();
    });

    setTimeout(reject, 1000);
  });

  try {
    await new Promise(async (resolve, reject) => {
      win.on("close", () => {
        closeLocalServer();
        resolve();
      });

      clnt.on("editor-connected", () => {
        console.log("Editor connected");
      });

      clnt.on("clone-complete", () => {
        console.log("Pulled remote site content");
        win.close();
      });

      const {
        editorConnected,
        mode,
        editorPort: localServerEditorPort
      } = await sendRequest(clnt, "GET_STATUS");

      if (editorConnected) {
        closeLocalServer();
        reject(
          "The local Wix Code server is already connected to a local editor. If you are in\nan editing session, please close it before trying to run this command again."
        );
      }

      if (mode !== "clone") {
        closeLocalServer();
        reject("Local server is not in clone mode");
      }

      if (!localServerEditorPort) {
        closeLocalServer();
        reject("Local server did not return an editor port");
      }

      const editorUrl = genEditorUrl(
        useSsl,
        process.env.WIXCODE_CLI_WIX_DOMAIN || "www.wix.com",
        wixCodeConfig.metasiteId,
        localServerEditorPort
      );

      win.webContents.on("did-navigate", (event, url) => {
        const parsed = new URL(url);
        if (parsed.hostname === signInHostname) {
          console.log("Authenticating user on www.wix.com");
          win.show();
        } else if (parsed.hostname === editorHostname) {
          console.log("User authenticated");
          win.hide();
        }
      });

      win.loadURL(editorUrl);
    });

    console.log(
      "Pull complete, run 'wix-code open-editor' to start editing the local copy"
    );

    process.exit(0);
  } catch (exc) {
    console.error(exc);
    process.exit(-1);
  }
};
