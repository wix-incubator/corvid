/* eslint-disable no-console */
const chalk = require("chalk");
const clone = require("../apps/clone");
const { login } = require("./login");
const { pull } = require("./pull");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const { sendCloneEvent } = require("../utils/bi");

async function cloneHandler(args) {
  const spinner = createSpinner();
  sessionData.on(["msid", "uuid"], (msid, uuid) => sendCloneEvent(msid, uuid));
  return login(spinner)
    .then(async cookie => {
      if (cookie) {
        await clone(spinner, args, cookie);
        await pull(spinner, {
          dir: args.dir
        });

        spinner.stop();
        await sessionData.callWithKeys(
          (msid, uuid) => sendCloneEvent(msid, uuid, "success"),
          "msid",
          "uuid"
        );
        return `Clone complete, run 'corvid open-editor' to start editing the local copy`;
      } else {
        throw new Error("Login failed");
      }
    })
    .catch(async error => {
      spinner.fail(error.message);
      await sessionData.callWithKeys(
        (msid, uuid) => sendCloneEvent(msid, uuid, "fail"),
        "msid",
        "uuid"
      );

      throw error;
    });
}

module.exports = {
  command: "clone <url>",
  describe: "clones a local Wix Site copy",
  builder: args =>
    args.positional("url", { describe: "Public site URL", type: "string" }),
  handler: args =>
    cloneHandler(Object.assign({}, args, { dir: process.cwd() })).then(
      message => {
        console.log(chalk.green(message));
        process.exit(0);
      },
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
    ),
  clone: cloneHandler
};
