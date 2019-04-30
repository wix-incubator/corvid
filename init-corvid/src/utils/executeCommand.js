const spawn = require("cross-spawn");
const path = require("path");

const executeCommand = async (dir, cmd, args) => {
  const child = spawn(cmd, args, {
    cwd: path.resolve(dir),
    stdio: "inherit"
  });

  await new Promise((resolve, reject) => {
    child.on("error", error => {
      reject(error);
    });

    child.on("close", code => {
      if (code !== 0) {
        reject();
        return;
      }
      resolve();
    });
  });
};

module.exports = executeCommand;
