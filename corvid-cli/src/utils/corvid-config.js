const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

async function readCorvidConfig(dir) {
  const json = await new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, ".corvidrc.json"), (exc, config) => {
      if (exc) {
        if (exc.code === "ENOENT") {
          reject(
            chalk`{red Project not found in ${path.resolve(
              dir
            )}}\nRun the command from a project's root folder`
          );
        } else {
          reject(exc);
        }
      } else {
        resolve(config);
      }
    });
  });

  return JSON.parse(json);
}

async function writeCorvidConfig(dir, config) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(dir, ".corvidrc.json"),
      JSON.stringify(config, null, 2),
      error => (error == null ? resolve() : reject(error))
    );
  });
}

module.exports = { readCorvidConfig, writeCorvidConfig };
