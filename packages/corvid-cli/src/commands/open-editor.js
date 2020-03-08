const fs = require("fs-extra");
const path = require("path");
const process = require("process");
const chalk = require("chalk");
const { launch, getRunningProcesses } = require("../utils/electron");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const { sendOpenEditorEvent } = require("../utils/bi");
const { readCorvidConfig } = require("../utils/corvid-config");
const getMessage = require("../messages");
const { UserError } = require("corvid-local-logger");
const commandWithDefaults = require("../utils/commandWithDefaults");
const prompts = require("prompts");
const {
  versions: { readFileSystemLayoutVersion }
} = require("corvid-local-site");

let userCommandIndex = 0;
const promptForCommand = async () => {
  const response = await prompts({
    type: "text",
    message: "Type a command",
    name: "command"
  });
  const [cp] = getRunningProcesses();
  cp.send({ ...response, i: userCommandIndex });
  await new Promise(resolve => {
    function listener(msg) {
      const { result, i } = msg;
      if (i === userCommandIndex) {
        userCommandIndex++;
        cp.removeListener("message", listener);
        resolve(result);
      }
    }
    cp.on("message", listener);
    // eslint-disable-next-line no-console
  }).then(result => console.log(result));
  await promptForCommand();
};

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
    launch(
      path.join(__dirname, "../electron/open-editor"),
      {
        // TODO uncomment the following two option to spawn the app in the
        // background once the local server can be spawned in the background as
        // well
        //detached: true,
        stdio: ["pipe", "pipe", "pipe", "ipc"],
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
          promptForCommand();
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
        },
        closingWithUnsavedChanges: () => {
          // eslint-disable-next-line no-console
          console.log("You have unsaved changes in editor");
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
