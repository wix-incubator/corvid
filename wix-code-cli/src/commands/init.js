/* eslint-disable no-console */
const path = require("path");
const chalk = require("chalk");
const { launch } = require("../utils/electron");
const init = require("../apps/init");

module.exports = {
  command: "init <url> [dir]",
  describe: "intialises a local Wix Code copy",
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
    launch(path.resolve(path.join(__dirname, "login.js")))
      .then(messages =>
        init(args, messages.filter(({ msg }) => msg === "authCookie")[0].cookie)
      )
      .then(projectDir =>
        launch(path.resolve(path.join(__dirname, "pull.js")), {
          cwd: projectDir,
          env: {
            ...process.env,
            IGNORE_CERTIFICATE_ERRORS: args.ignoreCertificate
          }
        })
      )
      .then(
        () => process.exit(0),
        error => {
          if (error.name && error.name === "FetchError") {
            console.log(chalk.red("Failed to retrieve site list"));
          } else {
            console.log(error);
          }
          process.exit(-1);
        }
      );
  }
};
