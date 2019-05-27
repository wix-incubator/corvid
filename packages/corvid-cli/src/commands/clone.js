/* eslint-disable no-console */
const chalk = require("chalk");
const clone = require("../apps/clone");
const { login } = require("./login");
const { pull } = require("./pull");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const { sendCloneEvent } = require("../utils/bi");
const getMessage = require("../messages");

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
        return getMessage("Clone_Command_Complete");
      } else {
        throw new Error(getMessage("Clone_Command_Login_Failed_Error"));
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
  describe: getMessage("Clone_Command_Description"),
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
            console.log(
              chalk.red(getMessage("Clone_Command_Cannot_Fetch_Error"))
            );
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
