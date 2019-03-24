/* eslint-disable no-console */
const process = require("process");
const client = require("socket.io-client");
const chalk = require("chalk");
const { startInCloneMode } = require("@wix/wix-code-local-server/src/server");
const genEditorUrl = require("../utils/genEditorUrl");
const { sendRequest } = require("../utils/socketIoHelpers");
const readWixCodeConfig = require("../utils/read-wix-code-config");
const serverErrors = require("../utils/server-errors");

const signInHostname = "users.wix.com";
const editorHostname = "editor.wix.com";

module.exports = ({ useSsl = true } = {}) => async win => {
  const wixCodeConfig = await readWixCodeConfig(".");

  const {
    adminPort: localServerPort,
    close: closeLocalServer
  } = await startInCloneMode(".").catch(exc => {
    if (exc.message in serverErrors) {
      throw chalk.red(serverErrors[exc.message]);
    }
  });

  const clnt = client.connect(`http://localhost:${localServerPort}`);

  await new Promise((resolve, reject) => {
    clnt.on("connect", () => {
      console.log(chalk.grey("Local server connection established"));
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
        console.log(chalk.grey("Editor connected"));
      });

      clnt.on("clone-complete", () => {
        console.log(chalk.grey("Pulled remote site content"));
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
          chalk.red(
            "The local Wix Code server is already connected to a local editor. If you are in\nan editing session, please close it before trying to run this command again."
          )
        );
      }

      if (mode !== "clone") {
        closeLocalServer();
        reject(chalk.red("Local server is not in clone mode"));
      }

      if (!localServerEditorPort) {
        closeLocalServer();
        reject(chalk.red("Local server did not return an editor port"));
      }

      win.webContents.on("did-navigate", (event, url) => {
        const parsed = new URL(url);
        if (parsed.hostname === signInHostname) {
          console.log(chalk.grey("Authenticating user on www.wix.com"));
          win.show();
        } else if (parsed.hostname === editorHostname) {
          console.log(chalk.grey("User authenticated"));
          win.hide();
        }
      });

      const editorUrl = genEditorUrl(
        useSsl,
        process.env.WIXCODE_CLI_WIX_DOMAIN || "www.wix.com",
        wixCodeConfig.metasiteId,
        localServerEditorPort
      );

      win.loadURL(editorUrl);
    });

    console.log(
      chalk.green(
        "Pull complete, run 'wix-code open-editor' to start editing the local copy"
      )
    );

    process.exit(0);
  } catch (exc) {
    console.error(exc);
    process.exit(-1);
  }
};
