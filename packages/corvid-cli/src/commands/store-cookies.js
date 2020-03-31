const childProcess = require("child_process");
const path = require("path");
const electron = require("electron");

const commandWithDefaults = require("../utils/commandWithDefaults");

const storeCookies = ({ cookies }) =>
  new Promise((resolve, reject) => {
    const cp = childProcess.spawn(
      electron,
      [
        path.join(__dirname, "../electron/store-cookies.js"),
        `--cookies=${cookies}`
      ],
      {
        stdio: ["inherit", "inherit", "inherit", "ipc"]
      }
    );
    cp.on("exit", (code, signal) => {
      code === 0 || (code === null && signal === "SIGTERM")
        ? resolve()
        : reject(code);
    });
  });

module.exports = commandWithDefaults({
  command: "store-cookies",
  describe: false, // hide this command
  builder: args =>
    args.option("cookies", {
      describe: "stringified cookies array to store",
      type: "string",
      hidden: true
    }),
  handler: storeCookies
});
