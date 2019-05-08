const spawn = require("cross-spawn");

const execScript = async (dir, command, args = []) => {
  const child = spawn(command, args, {
    cwd: dir
  });

  let stdout = "";
  let stderr = "";

  return new Promise((resolve, reject) => {
    child.on("error", error => {
      reject(error);
    });

    child.stdout.on("data", data => {
      stdout += data.toString();
    });

    child.stderr.on("data", data => {
      stderr += data.toString();
    });

    child.on("close", code => {
      if (code !== 0 || stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = execScript;
