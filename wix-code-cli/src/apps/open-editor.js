/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const genEditorUrl = require("../utils/genEditorUrl");

const openEditorApp = ({ useSsl = true } = {}) => ({
  serverMode: "edit",
  handler: async (wixCodeConfig, win, client, localServerStatus) => {
    await new Promise(async (resolve, reject) => {
      client.on("editor-connected", () => {
        console.log(chalk.green("Editor opened successfully"));
        resolve();
      });

      client.on("editor-disconnected", () => {
        console.log(chalk.grey("Editor disconnected"));
        resolve();
      });

      const {
        editorConnected,
        mode,
        editorPort: localServerEditorPort
      } = localServerStatus;

      if (editorConnected) {
        reject(
          chalk.red(
            `The local Wix Code server is already connected to a local editor. If you are in\nan editing session, please close it before trying to run this command again.`
          )
        );
      }

      if (mode !== "edit") {
        reject(chalk.red("Local server is not in edit mode"));
      }

      if (!localServerEditorPort) {
        reject(chalk.red("Local server did not return an editor port"));
      }

      const editorUrl = genEditorUrl(
        useSsl,
        process.env.WIXCODE_CLI_WIX_DOMAIN || "www.wix.com",
        wixCodeConfig.metasiteId,
        localServerEditorPort
      );

      win.loadURL(editorUrl);
    });
  }
});

module.exports = openEditorApp;
