/* eslint-disable no-console */
const fs = require("fs-extra");
const path = require("path");
const { UserError } = require("corvid-local-logger");
const clone = require("../apps/clone");
const { login } = require("./login");
const { pull } = require("./pull");
const createSpinner = require("../utils/spinner");
const sessionData = require("../utils/sessionData");
const { sendCloneEvent } = require("../utils/bi");
const getMessage = require("../messages");
const difference_ = require("lodash/difference");
const reject_ = require("lodash/reject");
const paths = require("../utils/paths");
const { killAllChildProcesses } = require("../utils/electron");
const commandWithDefaults = require("../utils/commandWithDefaults");

function withCleanUp(asyncCallback) {
  const dirContent = async rootPath => {
    let corvidDirItems = [];
    const dirItems = await fs.readdir(rootPath);
    if (dirItems.includes(paths.corvidDir)) {
      corvidDirItems = reject_(
        await fs.readdir(path.join(rootPath, paths.corvidDir)),
        paths.logFileName
      ).map(item => path.join(paths.corvidDir, item));
    }
    return [...dirItems, ...corvidDirItems];
  };

  return async args => {
    const rootPath = args.dir;
    const dirContentsBefore = await dirContent(rootPath);
    try {
      return await asyncCallback(args);
    } catch (error) {
      await killAllChildProcesses();
      const dirContents = await dirContent(rootPath);
      await Promise.all(
        difference_(dirContents, dirContentsBefore).map(pathPart =>
          fs.remove(path.join(rootPath, pathPart))
        )
      );
      throw error;
    }
  };
}

async function cloneHandler(args) {
  const spinner = createSpinner();
  sessionData.on(["msid", "uuid"], (msid, uuid) => sendCloneEvent(msid, uuid));
  return login(spinner, args)
    .then(async cookie => {
      if (cookie) {
        await clone(spinner, args, cookie);
        await pull(spinner, {
          dir: args.dir,
          ignoreCertificate: args.ignoreCertificate
        });

        spinner.stop();
        await sessionData.callWithKeys(
          (msid, uuid) => sendCloneEvent(msid, uuid, "success"),
          "msid",
          "uuid"
        );
        return getMessage("Clone_Command_Complete");
      } else {
        throw new UserError(getMessage("Clone_Command_Login_Failed_Error"));
      }
    })
    .catch(async error => {
      spinner.fail();
      await sessionData.callWithKeys(
        (msid, uuid) => sendCloneEvent(msid, uuid, "fail"),
        "msid",
        "uuid"
      );

      throw error;
    });
}

module.exports = commandWithDefaults({
  command: "clone <url>",
  describe: getMessage("Clone_Command_Description"),
  builder: args =>
    args.positional("url", { describe: "Public site URL", type: "string" }),
  handler: args =>
    withCleanUp(cloneHandler)(Object.assign({ dir: process.cwd() }, args))
});
