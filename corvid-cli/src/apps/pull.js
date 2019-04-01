/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const genEditorUrl = require("../utils/genEditorUrl");

const pullApp = ({ useSsl = true } = {}) => ({
  serverMode: "clone",
  handler: async (corvidConfig, win, client, localServerStatus) => {
    await new Promise(async (resolve, reject) => {
      // this event is not fired by the server yet
      client.on("clone-complete", () => {
        console.log(chalk.grey("Project downloaded"));
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
            "The local Wix Code server is already connected to a local editor. If you are in\nan editing session, please close it before trying to run this command again."
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
        useSsl,
        process.env.CORVID_CLI_WIX_DOMAIN || "www.wix.com",
        corvidConfig.metasiteId,
        localServerEditorPort
      );

      win.loadURL(editorUrl);
    });

    console.log(
      chalk.green(
        "Pull complete, run 'corvid open-editor' to start editing the local copy"
      )
    );
  }
});

module.exports = pullApp;
