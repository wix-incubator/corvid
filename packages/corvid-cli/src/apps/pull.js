/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const genEditorUrl = require("../utils/genEditorUrl");
const logger = require("corvid-local-logger");
const clientMessages = require("../utils/console-messages");
const clientMessageActions = require("../utils/clientMessageActions");
const getMessage = require("../messages");
const { getBiContextHeader } = require("../utils/bi");
const EditorError = require("../utils/EditorError");

const pullApp = ({ useSsl = true, override = false, move = false } = {}) => ({
  serverMode: "clone",
  serverArgs: { override, move },
  handler: async (corvidConfig, win, client, localServerStatus) => {
    const isHeadless = true;
    await new Promise(async (resolve, reject) => {
      // this event is not fired by the server yet
      client.on("clone-complete", () => {
        console.log(JSON.stringify({ event: "projectDownloaded" }));
        resolve();
      });

      client.on("user-message", message => {
        logger.info(getMessage("Pull_User_Message_Log", { message }));
        console.log(message);
      });

      const {
        editorConnected,
        mode,
        editorPort: localServerEditorPort
      } = localServerStatus;

      if (editorConnected) {
        reject(new Error(getMessage("Pull_Already_Connected_Error")));
      }

      if (mode !== "clone") {
        reject(new Error(getMessage("Pull_Not_Clone_Mode_Error")));
      }

      if (!localServerEditorPort) {
        reject(new Error(getMessage("Pull_No_Editor_Port_Error")));
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
            logger.error(new EditorError(message));
            reject(
              new Error(
                chalk.red(getMessage("Pull_Client_Console_Fatal_Error"))
              )
            );
          }
        })
      );

      logger.info(`pulling [${editorUrl}]`);
      const extraHeaders = getBiContextHeader(isHeadless);
      win.loadURL(editorUrl, { httpReferrer: editorUrl, extraHeaders });
    });
  }
});

module.exports = pullApp;
