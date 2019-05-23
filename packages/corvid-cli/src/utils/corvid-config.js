const fs = require("fs-extra");
const path = require("path");
const sessionData = require("./sessionData");
const getMessage = require("../messages");

const configFilePath = root => path.join(root, ".corvidrc.json");

async function readCorvidConfig(dir) {
  const json = await new Promise((resolve, reject) => {
    fs.readFile(configFilePath(dir), (exc, config) => {
      if (exc) {
        if (exc.code === "ENOENT") {
          reject(
            new Error(
              getMessage("CorvidConfig_No_Project_Error", {
                dir: path.resolve(dir)
              })
            )
          );
        } else {
          reject(exc);
        }
      } else {
        resolve(config);
      }
    });
  });

  const configObj = JSON.parse(json);
  await sessionData.set({ msid: configObj.metasiteId });
  return configObj;
}

async function doesConfigExist(dir) {
  return fs.exists(configFilePath(dir));
}

async function writeCorvidConfig(dir, config) {
  return new Promise((resolve, reject) => {
    fs.writeFile(configFilePath(dir), JSON.stringify(config, null, 2), error =>
      error == null ? resolve() : reject(error)
    );
  });
}

module.exports = { readCorvidConfig, writeCorvidConfig, doesConfigExist };
