/* eslint-disable no-console */
const handleCommandResult = require("../utils/commandResult");
const init = require("../apps/init");

module.exports = {
  command: "init <url> <dir>",
  describe: "intialises a local Wix Code copy",
  builder: args =>
    args
      .positional("url", { describe: "Public site URL", type: "string" })
      .positional("dir", {
        describe: "local directory to download data to",
        type: "string"
      }),
  handler: handleCommandResult(init)
};
