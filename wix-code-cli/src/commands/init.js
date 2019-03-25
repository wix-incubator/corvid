/* eslint-disable no-console */
const path = require("path");
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
      }),
  handler: args => {
    init(args).then(
      projectDir => {
        launch(path.resolve(path.join(__dirname, "pull.js")), {
          cwd: projectDir
        });
      },
      error => {
        console.log(error);
        process.exit(-1);
      }
    );
  }
};
