/* eslint-disable no-console */
const path = require("path");
const chalk = require("chalk");
const init = require("../apps/init");
const { login } = require("./login");
const { pull } = require("./pull");
const createSpinner = require("../utils/spinner");

module.exports = {
  command: "init <url> [dir]",
  describe: "intializes a local Wix Site copy",
  builder: args =>
    args
      .positional("url", { describe: "Public site URL", type: "string" })
      .positional("dir", {
        describe: "local directory to download data to",
        type: "string"
      })
      .option("ignore-certificate", {
        describe: "ignore certificate errors",
        type: "boolean"
      }),
  handler: args => {
    const spinner = createSpinner();
    login(spinner)
      .then(async cookie => {
        if (cookie) {
          const projectDir = await init(spinner, args, cookie);
          await pull(spinner, {
            C: projectDir,
            ignoreCertificate: args.ignoreCertificate
          });

          spinner.stop();
          console.log(
            chalk.green(
              `Initialisation complete, change directory to '${path.resolve(
                projectDir
              )}' and run 'corvid open-editor' to start editing the local copy`
            )
          );
        } else {
          throw new Error("Login failed");
        }
      })
      .then(
        () => process.exit(0),
        error => {
          if (error) {
            if (error.name === "FetchError") {
              console.log(chalk.red("Failed to retrieve site list"));
            } else if (error.message) {
              console.log(chalk.red(error.message));
            } else {
              console.log(error);
            }
          }

          process.exit(-1);
        }
      );
  }
};
