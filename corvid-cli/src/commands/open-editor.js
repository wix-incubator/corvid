/* eslint-disable no-console */
const process = require("process");
const chalk = require("chalk");
const { app } = require("electron");
const { openWindow, launch } = require("../utils/electron");
const createSpinner = require("../utils/spinner");
const openEditorApp = require("../apps/open-editor");

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

    await openWindow(openEditorApp(), { show: true });
    app.exit(0);
  });

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
    const { login } = require("./login");
    try {
      const spinner = createSpinner();
      await login(spinner);

      spinner.start(chalk.grey("Connecting to local server"));

      await launch(
        __filename,
        {
          // TODO uncomment the following two option to spawn the app in the
          // background once the local server can be spawned in the background as
          // well
          //detached: true,
          //stdio: "ignore",
          cwd: args.C,
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
            spinner.succeed(chalk.grey("Editor connected"));
          }
        }
      );

      spinner.stop();
    } catch (_) {
      return;
    }
  }
};
