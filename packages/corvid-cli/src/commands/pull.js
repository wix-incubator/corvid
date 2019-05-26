/* eslint-disable no-console */
const path = require("path");
const process = require("process");
const chalk = require("chalk");
const { app } = require("electron");
const yargs = require("yargs");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const { sendPullEvent } = require("../utils/bi");
const { readCorvidConfig } = require("../utils/corvid-config");
const getMessage = require("../messages");

app &&
  app.on("ready", async () => {
    const args = yargs.argv;
    try {
      await openWindow(pullApp({ override: args.override, move: args.move }));
    } catch (exc) {
      process.exit(-1);
    }
  });

async function pullCommand(spinner, args) {
  spinner.start(chalk.grey(getMessage("Pull_Command_Connecting")));
  const pullArgs = [];

  if (args.override) pullArgs.push("--override");
  if (args.move) pullArgs.push("--move");

  await new Promise((resolve, reject) => {
    launch(
      __filename,
      {
        cwd: args.dir,
        env: {
          ...process.env
        }
      },
      {
        localServerConnected: () => {
          spinner.start(chalk.grey(getMessage("Pull_Command_Waiting")));
        },
        editorConnected: () => {
          spinner.start(chalk.grey(getMessage("Pull_Command_Downloading")));
        },
        projectDownloaded: () => {
          spinner.start(chalk.grey(getMessage("Pull_Command_Downloaded")));
          resolve();
        },
        error: error => {
          spinner.fail();
          const errorMessage = getMessage(error);
          if (errorMessage) {
            if (error === "CAN_NOT_PULL_NON_EMPTY_SITE") {
              console.log(
                chalk.red(getMessage("Pull_Command_Not_Empty_Red_Log"))
              );
              console.log(chalk(getMessage("Pull_Command_Not_Empty_Log")));
            } else {
              reject(new Error(errorMessage));
            }
          } else {
            reject(new Error(error));
          }
        }
      },
      pullArgs
    ).catch(reject);
  });
}

async function pullHandler(args) {
  const { login } = require("./login");
  const spinner = createSpinner();
  const targetDirectory = path.resolve(args.dir);
  sessionData.on(["msid", "uuid"], (msid, uuid) =>
    sendPullEvent(msid, uuid, "start", {
      type: args.override ? "override" : args.move ? "move" : "regular"
    })
  );
  await readCorvidConfig(targetDirectory);
  return login(spinner)
    .then(async () => {
      await pullCommand(spinner, args);
      spinner.stop();
      await sessionData.callWithKeys(
        (msid, uuid) =>
          sendPullEvent(msid, uuid, "success", {
            type: args.override ? "override" : args.move ? "move" : "regular"
          }),
        "msid",
        "uuid"
      );
      return getMessage("Pull_Command_Complete");
    })
    .catch(async error => {
      if (spinner.isSpinning) spinner.fail(error.message);
      await sessionData.callWithKeys(
        (msid, uuid) =>
          sendPullEvent(msid, uuid, "fail", {
            type: args.override ? "override" : args.move ? "move" : "regular"
          }),
        "msid",
        "uuid"
      );
      throw error;
    });
}

module.exports = {
  command: "pull",
  describe: getMessage("Pull_Command_Description"),
  builder: args =>
    args
      .option("override", {
        describe: getMessage("Pull_Command_Override_Description"),
        type: "boolean"
      })
      .option("move", {
        describe: getMessage("Pull_Command_Move_Description"),
        type: "boolean"
      })
      .conflicts("override", "move"),
  handler: async args =>
    pullHandler(Object.assign({}, args, { dir: process.cwd() })).then(
      message => {
        if (message) console.log(chalk.green(message));
        process.exit(0);
      },
      error => {
        if (error && error.message) console.log(chalk.red(error.message));
        process.exit(-1);
      }
    ),
  pull: pullCommand,
  pullHandler
};
