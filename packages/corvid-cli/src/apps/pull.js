/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const genEditorUrl = require("../utils/genEditorUrl");
const logger = require("corvid-local-logger");
const clientMessages = require("../utils/console-messages");
const clientMessageActions = require("../utils/clientMessageActions");
const getMessage = require("../messages");

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

      client.on("user-message", message => {
        logger.error(getMessage("Pull_User_Message_Log", { message }));
        console.log(message);
      });

      const {
        editorConnected,
        mode,
        editorPort: localServerEditorPort
      } = localServerStatus;

      if (editorConnected) {
        reject(chalk.red(getMessage("Pull_Already_Connected_Error")));
      }

      if (mode !== "clone") {
        reject(chalk.red(getMessage("Pull_Not_Clone_Mode_Error")));
      }

      if (!localServerEditorPort) {
        reject(chalk.red(getMessage("Pull_No_Editor_Port_Error")));
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
            logger.error(
              getMessage("Pull_Client_Console_Fatal_Error_Message", { message })
            );
            reject(
              new Error(
                chalk.red(getMessage("Pull_Client_Console_Fatal_Error"))
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
