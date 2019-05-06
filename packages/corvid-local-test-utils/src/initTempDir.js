const util = require("util");
const temp = require("temp").track();
const dirAsJson = require("corvid-dir-as-json");
const fs = require("fs");
const path = require("path");

const makeTempDir = util.promisify(temp.mkdir);
const makeDir = util.promisify(fs.mkdir);

const initTempDir = async (files, parentDir) => {
  const dirName = "test-site";
  const tempLocalSitePath = await (parentDir
    ? makeDir(path.join(parentDir, dirName)).then(() =>
        path.join(parentDir, dirName)
      )
    : makeTempDir(dirName));
  if (files) {
    await dirAsJson.writeJsonToDir(tempLocalSitePath, files);
  }
  return tempLocalSitePath;
};

module.exports = initTempDir;
