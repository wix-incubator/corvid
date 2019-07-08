const fs = require("fs-extra");
const path = require("path");
const sessionData = require("./sessionData");
const getMessage = require("../messages");
const { UserError } = require("corvid-local-logger");
const paths = require("../utils/paths");

const configFilePath = root =>
  path.join(root, paths.corvidDir, paths.configFileName);

async function readCorvidConfig(dir) {
  const json = await new Promise((resolve, reject) => {
    fs.readFile(configFilePath(dir), (exc, config) => {
      if (exc) {
        if (exc.code === "ENOENT") {
          reject(
            new UserError(
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
  const filePath = configFilePath(dir);
  await fs.ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(config, null, 2));
}

module.exports = { readCorvidConfig, writeCorvidConfig, doesConfigExist };
