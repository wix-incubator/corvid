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
const serverErrors = require("../utils/server-errors");
const sessionData = require("../utils/sessionData");
const { sendOpenEditorEvent } = require("../utils/bi");
const { readCorvidConfig } = require("../utils/corvid-config");

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
      process.exit(-1);
    }
  });

async function openEditorHandler(args) {
  const { login } = require("./login");
  const spinner = createSpinner();
  const directory = args.C || ".";
  await readCorvidConfig(directory);
  sessionData.on(["msid", "uuid"], (msid, uuid) =>
    sendOpenEditorEvent(msid, uuid)
  );

  try {
    fs.readdirSync(directory);
  } catch (exc) {
    throw new Error(`Directory ${directory} does not exist`);
  }
  await login(spinner);

  spinner.start(chalk.grey("Connecting to local server"));

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
          spinner.start(chalk.grey("Waiting for editor to connect"));
        },
        editorConnected: () => {
          sessionData.callWithKeys(
            (msid, uuid) => sendOpenEditorEvent(msid, uuid, "success"),
            "msid",
            "uuid"
          );
          spinner.succeed(chalk.grey("Editor connected"));
          resolve();
        },
        error: error => {
          spinner.fail();
          sessionData.callWithKeys(
            (msid, uuid) => sendOpenEditorEvent(msid, uuid, "fail"),
            "msid",
            "uuid"
          );
          if (error in serverErrors) {
            reject(new Error(serverErrors[error]));
          } else {
            reject(new Error(error));
          }
        }
      }
    ).then(resolve, reject);
  });

  spinner.stop();
}

module.exports = {
  command: "open-editor",
  describe: "launches the local editor to edit the local site",
  builder: args =>
    args
      .option("C", { describe: "path", type: "string" })
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean"
      }),
  handler: async args => {
    openEditorHandler(args).catch(error => {
      console.log(chalk.red(error.message));
      process.exit(-1);
    });
  },
  openEditorHandler
};
