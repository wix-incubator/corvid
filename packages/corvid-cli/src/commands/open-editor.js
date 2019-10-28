/* eslint-disable no-console */
const fs = require("fs-extra");
const path = require("path");
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
const commandWithDefaults = require("../utils/commandWithDefaults");
const {
  versions: { readFileSystemLayoutVersion }
} = require("corvid-local-site");

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

    await openWindow(openEditorApp(), {
      show: true && !process.env.CORVID_FORCE_HEADLESS
    });
  });

const ensureLocalFileSystemVersion = async siteRootPath => {
  const existingFileSystemLayoutVersion = await readFileSystemLayoutVersion(
    path.join(siteRootPath, "src")
  );
  if (
    existingFileSystemLayoutVersion &&
    Number(existingFileSystemLayoutVersion) < 2
  ) {
    throw new UserError(
      getMessage("OLD_FILE_SYSTEM_LAYOUT_NOT_SUPPORTED", {
        oldCliVersion: "0.1.83"
      })
    );
  }
};

async function openEditorHandler(args) {
  const siteDirectory = args.dir;
  await ensureLocalFileSystemVersion(siteDirectory);
  const openEditorArgs = [];
  if (args.remoteDebuggingPort)
    openEditorArgs.push(`--remote-debugging-port=${args.remoteDebuggingPort}`);
  const { login } = require("./login");
  const spinner = createSpinner();
  await readCorvidConfig(siteDirectory);
  sessionData.on(["msid", "uuid"], (msid, uuid) =>
    sendOpenEditorEvent(msid, uuid)
  );

  try {
    fs.readdirSync(siteDirectory);
  } catch (exc) {
    throw new UserError(
      getMessage("OpenEditor_Command_No_Folder_Error", {
        directory: siteDirectory
      })
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
        cwd: siteDirectory,
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
    ).then(resolve, reject);
  }).catch(err => {
    spinner.fail();
    throw err;
  });

  spinner.stop();
}

module.exports = commandWithDefaults({
  command: "open-editor",
  describe: getMessage("OpenEditor_Command_Description"),
  handler: async args =>
    openEditorHandler(Object.assign({ dir: process.cwd() }, args))
});
