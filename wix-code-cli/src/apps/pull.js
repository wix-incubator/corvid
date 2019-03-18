/* eslint-disable no-console */
const process = require("process");
const client = require("socket.io-client");
const genEditorUrl = require("../utils/genEditorUrl");

const signInPage = "https://users.wix.com/signin";

module.exports = (
  wixCodeConfig,
  localServerPort,
  closeLocalServer,
  { useSsl = true }
) => win => {
  const clnt = client(`http://localhost:${localServerPort}`);

  return new Promise((resolve, reject) => {
    win.on("close", () => {
      closeLocalServer().then(resolve);
    });

    clnt.on("editor-connected", () => {
      console.log("editor connected");
    });

    clnt.on("clone-complete", () => {
      console.log("pulled remote site content");
      win.close();
    });

    clnt.on(
      "status",
      ({ connected, mode, editorPort: localServerEditorPort }) => {
        if (connected) {
          closeLocalServer().then(() => {
            reject(`The local Wix Code server is already connected to a local editor. If you are in
an editing session, please close it before trying to run this command again.`);
          });
        }

        if (mode !== "clone") {
          closeLocalServer().then(() => {
            reject("local server is not in clone mode");
          });
        }

        if (!localServerEditorPort) {
          closeLocalServer().then(() => {
            reject("local server did not return an editor port");
          });
        }

        const editorUrl = genEditorUrl(
          useSsl,
          process.env.WIXCODE_CLI_WIX_DOMAIN || "www.wix.com",
          wixCodeConfig.metasiteId,
          localServerEditorPort
        );

        win.webContents.on("did-navigate", (event, url) => {
          if (url.startsWith(signInPage)) {
            win.show();
          } else if (url === editorUrl) {
            win.hide();
          }
        });

        win.loadURL(editorUrl);
      }
    );
  })
    .then(() => {
      console.log(
        "pull complete, run 'wix-code open-editor' to start editing the local copy"
      );
      process.exit(0);
    })
    .catch(reason => {
      console.error(reason);
      process.exit(-1);
    });
};
