const fs = require("fs");
const path = require("path");
const sessionData = require("./sessionData");

async function readCorvidConfig(dir) {
  const json = await new Promise((resolve, reject) => {
    fs.readFile(path.join(dir, ".corvidrc.json"), (exc, config) => {
      if (exc) {
        if (exc.code === "ENOENT") {
          reject(new Error(`Project not found in ${path.resolve(dir)}`));
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
