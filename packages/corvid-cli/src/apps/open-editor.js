/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const logger = require("corvid-local-logger");
const genEditorUrl = require("../utils/genEditorUrl");
const clientMessages = require("../utils/console-messages");
const clientMessageActions = require("../utils/clientMessageActions");
const getMessage = require("../messages");
const { getBiContextHeader } = require("../utils/bi");

const openEditorApp = ({ useSsl = true } = {}) => ({
  serverMode: "edit",
  handler: async (corvidConfig, win, client, localServerStatus) => {
    await new Promise(async (resolve, reject) => {
      client.on("editor-connected", () => {
        // TODO uncomment the following once the open-editor command can exit while the editor is
        // open
        //resolve();
      });

      client.on("user-message", message => {
        logger.error(getMessage("OpenEditor_User_Message_Log", { message }));
        console.log(message);
      });

      const {
        editorConnected,
        mode,
        editorPort: localServerEditorPort
      } = localServerStatus;

      if (editorConnected) {
        reject(
          new Error(chalk.red(getMessage("OpenEditor_Already_Connected_Error")))
        );
      }

      if (mode !== "edit") {
        reject(
          new Error(chalk.red(getMessage("OpenEditor_Not_Edit_Mode_Error")))
        );
      }

      if (!localServerEditorPort) {
        reject(
          new Error(chalk.red(getMessage("OpenEditor_No_Editor_Port_Error")))
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
            logger.error(
              getMessage("OpenEditor_Client_Console_Fatal_Error_Message", {
                message
              })
            );
            reject(
              new Error(
                chalk.red(getMessage("OpenEditor_Client_Console_Fatal_Error"))
              )
            );
          }
        })
      );

      logger.info(`opening editor for [${editorUrl}]`);
      const extraHeaders = getBiContextHeader(win.isVisible());
      win.loadURL(editorUrl, { httpReferrer: editorUrl, extraHeaders });
    });
  }
});

module.exports = openEditorApp;
