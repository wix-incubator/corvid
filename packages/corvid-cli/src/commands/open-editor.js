/* eslint-disable no-console */
const fs = require("fs");
const process = require("process");
const chalk = require("chalk");
const { app } = require("electron");
const {
  openWindow,
  launch,
  killAllChildProcesses
} = require("../utils/electron");
const createSpinner = require("../utils/spinner");
const openEditorApp = require("../apps/open-editor");
const sessionData = require("../utils/sessionData");
const { sendOpenEditorEvent } = require("../utils/bi");
const { readCorvidConfig } = require("../utils/corvid-config");
const getMessage = require("../messages");
const { UserError } = require("corvid-local-logger");
const { exitWithError } = require("../utils/exitProcess");

app &&
  app.on("ready", async () => {
    if (process.env.IGNORE_CERTIFICATE_ERRORS) {
      app.on(
        "certificate-error",
        (event, webContents, url, error, certificate, callback) => {
          // On certificate error we disable default behaviour (stop loading the page)
          // and we then say "it is all fine - true" to the callback
          event.preventDefault();
          callback(true);
        }
      );
    }

    try {
      await openWindow(openEditorApp(), {
        show: true && !process.env.CORVID_FORCE_HEADLESS
      });
    } catch (exc) {
      exitWithError(exc);
    }
  });

async function openEditorHandler(args) {
  const openEditorArgs = [];
  if (args.remoteDebuggingPort)
    openEditorArgs.push(`--remote-debugging-port=${args.remoteDebuggingPort}`);
  const { login } = require("./login");
  const spinner = createSpinner();
  const directory = args.dir;
  await readCorvidConfig(directory);
  sessionData.on(["msid", "uuid"], (msid, uuid) =>
    sendOpenEditorEvent(msid, uuid)
  );

  try {
    fs.readdirSync(directory);
  } catch (exc) {
    throw new UserError(
      getMessage("OpenEditor_Command_No_Folder_Error", { directory })
    );
  }
  await login(spinner);

  spinner.start(chalk.grey(getMessage("OpenEditor_Command_Connecting")));

  await new Promise((resolve, reject) => {
    process.on("exit", () => killAllChildProcesses());

    launch(
      __filename,
      {
        // TODO uncomment the following two option to spawn the app in the
        // background once the local server can be spawned in the background as
        // well
        //detached: true,
        //stdio: "ignore",
        cwd: directory,
        env: {
          ...process.env,
          IGNORE_CERTIFICATE_ERRORS: args.ignoreCertificate
        }
      },
      {
        localServerConnected: () => {
          spinner.start(chalk.grey(getMessage("OpenEditor_Command_Waiting")));
        },
        editorConnected: () => {
          sessionData.callWithKeys(
            (msid, uuid) => sendOpenEditorEvent(msid, uuid, "success"),
            "msid",
            "uuid"
          );
          spinner.succeed(
            chalk.grey(getMessage("OpenEditor_Command_Connected"))
          );
          resolve();
        },
        error: error => {
          spinner.fail();
          sessionData.callWithKeys(
            (msid, uuid) => sendOpenEditorEvent(msid, uuid, "fail"),
            "msid",
            "uuid"
          );
          const errorMessage = getMessage(error);
          if (errorMessage) {
            reject(new UserError(errorMessage));
          } else {
            reject(new Error(error));
          }
        }
      },
      openEditorArgs
    )
      .then(resolve, reject)
      .catch(e => {
        spinner.fail();
        throw e;
      });
  });

  spinner.stop();
}

module.exports = {
  command: "open-editor",
  describe: getMessage("OpenEditor_Command_Description"),
  builder: args =>
    args
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean",
        hidden: true
      })
      .option("remote-debugging-port", {
        describe: "port for remote debugging",
        type: "number",
        hidden: true
      }),
  handler: async args => {
    openEditorHandler(Object.assign({}, args, { dir: process.cwd() })).catch(
      error => exitWithError(error)
    );
  },
  openEditorHandler
};
