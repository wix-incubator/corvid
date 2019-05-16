/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const logger = require("corvid-local-logger");
const genEditorUrl = require("../utils/genEditorUrl");
const clientMessages = require("../utils/console-messages");
const clientMessageActions = require("../utils/clientMessageActions");

const openEditorApp = ({ useSsl = true } = {}) => ({
  serverMode: "edit",
  handler: async (corvidConfig, win, client, localServerStatus) => {
    await new Promise(async (resolve, reject) => {
      client.on("editor-connected", () => {
        // TODO uncomment the following once the open-editor command can exit while the editor is
        // open
        //resolve();
      });

      const {
        editorConnected,
        mode,
        editorPort: localServerEditorPort
      } = localServerStatus;

      if (editorConnected) {
        reject(
          new Error(
            chalk.red(
              `The local Corvid server is already connected to a local editor. If you are in\nan editing session, please close it before trying to run this command again.`
            )
          )
        );
      }

      if (mode !== "edit") {
        reject(new Error(chalk.red("Local server is not in edit mode")));
      }

      if (!localServerEditorPort) {
        reject(
          new Error(chalk.red("Local server did not return an editor port"))
        );
      }

      const editorUrl = genEditorUrl(
        process.env.DISABLE_SSL ? false : useSsl,
        process.env.CORVID_CLI_WIX_DOMAIN || "www.wix.com",
        corvidConfig.metasiteId,
        localServerEditorPort,
        false,
        "local"
      );

      win.webContents.on(
        "console-message",
        clientMessageActions({
          [clientMessages.FATAL_ERROR_MESSAGE]: message => {
            logger.error(`Fatal error! ${message}`);
            reject(
              new Error(
                chalk.red(
                  "There was an error initializing your site. Please try again."
                )
              )
            );
          }
        })
      );

      win.loadURL(editorUrl, { httpReferrer: editorUrl });
    });
  }
});

module.exports = openEditorApp;
