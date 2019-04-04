/* eslint-disable no-console */
const path = require("path");
const process = require("process");
const chalk = require("chalk");
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const pullApp = require("../apps/pull");
const createSpinner = require("../utils/spinner");

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

    await openWindow(pullApp());
    app.exit(0);
  });

async function pullCommand(spinner, args) {
  spinner.start(chalk.grey("Connecting to local server"));

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
      }
    }
  );
}

module.exports = {
  command: "pull",
  describe: "pulls a local copy of the site",
  builder: args =>
    args
      .option("force", { describe: "force pull", type: "boolean" })
      .option("C", { describe: "path", type: "string" })
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean"
      }),
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
        spinner.fail();
      });
  },
  pull: pullCommand
};
