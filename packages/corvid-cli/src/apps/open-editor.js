/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const logger = require("corvid-local-logger");
const genEditorUrl = require("../utils/genEditorUrl");
const clientMessages = require("../utils/console-messages");
const clientMessageActions = require("../utils/clientMessageActions");
const getMessage = require("../messages");
const { getBiContextHeader } = require("../utils/bi");
const EditorError = require("../utils/EditorError");

const openEditorApp = ({ useSsl = true } = {}) => ({
  serverMode: "edit",
  handler: async (corvidConfig, win, client, localServerStatus) => {
    const isHeadless = false;

    await new Promise(async (resolve, reject) => {
      client.on("user-message", message => {
        logger.info(getMessage("OpenEditor_User_Message_Log", { message }));
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
        corvidConfig.metasiteId,
        localServerEditorPort,
        isHeadless
      );

      win.webContents.on(
        "console-message",
        clientMessageActions({
          [clientMessages.FATAL_ERROR_MESSAGE]: message => {
            reject(
              new EditorError(
                message,
                getMessage("OpenEditor_Client_Console_Fatal_Error")
              )
            );
          }
        })
      );

      logger.info(`opening editor for [${editorUrl}]`);
      const extraHeaders = getBiContextHeader(isHeadless);
      win.loadURL(editorUrl, { httpReferrer: editorUrl, extraHeaders });
    });
  }
});

module.exports = openEditorApp;
