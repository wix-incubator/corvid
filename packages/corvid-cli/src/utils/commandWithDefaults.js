const { asyncWithExit } = require("./exitProcess");

const identity = x => x;

const withDefaultArgs = (originalBuilder = identity) => args =>
  originalBuilder(args)
    .option("ignore-certificate", {
      describe: "ignore certificate errors",
      type: "boolean",
      hidden: true
    })
    .option("remote-debugging-port", {
      describe: "port for remote debugging",
      type: "number",
      hidden: true
    });

const commandWithDefaults = commandObj =>
  Object.assign({}, commandObj, {
    handler: asyncWithExit(commandObj.handler),
    builder: withDefaultArgs(commandObj.builder)
  });

module.exports = commandWithDefaults;
