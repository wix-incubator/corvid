/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const genEditorUrl = require("../utils/genEditorUrl");
const logger = require("corvid-local-logger");
const clientMessages = require("../utils/console-messages");
const clientMessageActions = require("../utils/clientMessageActions");

const pullApp = ({ useSsl = true, override = false, move = false } = {}) => ({
  serverMode: "clone",
  serverArgs: { override, move },
  handler: async (corvidConfig, win, client, localServerStatus) => {
    await new Promise(async (resolve, reject) => {
      // this event is not fired by the server yet
      client.on("clone-complete", () => {
        console.log(JSON.stringify({ event: "projectDownloaded" }));
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
            "The local Corvid server is already connected to a local editor. If you are in\nan editing session, please close it before trying to run this command again."
          )
        );
      }

      if (mode !== "clone") {
        reject(chalk.red("Local server is not in clone mode"));
      }

      if (!localServerEditorPort) {
        reject(chalk.red("Local server did not return an editor port"));
      }

      const editorUrl = genEditorUrl(
        process.env.DISABLE_SSL ? false : useSsl,
        process.env.CORVID_CLI_WIX_DOMAIN || "www.wix.com",
        corvidConfig.metasiteId,
        localServerEditorPort,
        true,
        "pull"
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

module.exports = pullApp;
