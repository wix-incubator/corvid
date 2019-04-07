/* eslint-disable no-console */
const path = require("path");
const process = require("process");
const chalk = require("chalk");
const { app } = require("electron");
const yargs = require("yargs");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");
const createSpinner = require("../utils/spinner");
const serverErrors = require("../utils/server-errors");

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

    const args = yargs.argv;
    await openWindow(pullApp({ override: args.override, move: args.move }));
  });

async function pullCommand(spinner, args) {
  spinner.start(chalk.grey("Connecting to local server"));
  const pullArgs = [];

  if (args.override) pullArgs.push("--override");
  if (args.move) pullArgs.push("--move");

  return launch(
    __filename,
    {
      cwd: args.C,
      env: { ...process.env, IGNORE_CERTIFICATE_ERRORS: args.ignoreCertificate }
    },
    {
      localServerConnected: () => {
        spinner.start(chalk.grey("Waiting for editor to connect"));
      },
      editorConnected: () => {
        spinner.start(chalk.grey("Downloading project"));
      },
      projectDownloaded: () => {
        spinner.start(chalk.grey("Downloaded project"));
      },
      error: error => {
        spinner.fail();
        if (error in serverErrors) {
          if (error === "CAN_NOT_PULL_NON_EMPTY_SITE") {
            console.log(chalk`{red Project directory already includes site files}

Run either:
  - 'corvid pull --move' to create a snapshot of your current project and pull the
    latest revision from the remote repository.
  - 'corvid pull --override' to override the existing site files with the latest
    revision from the remote repository.`);
          } else {
            console.log(chalk.red(serverErrors[error]));
          }
        } else {
          console.log(chalk.red(error));
        }
      }
    },
    pullArgs
  );
}

module.exports = {
  command: "pull",
  describe: "pulls a local copy of the site",
  builder: args =>
    args
      .option("override", {
        describe: "overwrite existing site files",
        type: "boolean"
      })
      .option("move", {
        describe: "move existing site files before pull",
        type: "boolean"
      })
      .option("C", { describe: "path", type: "string" })
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean"
      })
      .conflicts("override", "move"),
  handler: async args => {
    const { login } = require("./login");
    const spinner = createSpinner();
    login(spinner)
      .then(async () => {
        await pullCommand(spinner, args);
        spinner.stop();
        console.log(
          chalk.green(
            `Pull complete, change directory to '${path.resolve(
              args.C
            )}' and run 'corvid open-editor' to start editing the local copy`
          )
        );
      })
      .catch(() => {
        if (spinner.isSpinning) spinner.fail();
      });
  },
  pull: pullCommand
};
