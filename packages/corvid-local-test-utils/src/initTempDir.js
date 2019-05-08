const util = require("util");
const temp = require("temp").track();
const dirAsJson = require("corvid-dir-as-json");

const makeTempDir = util.promisify(temp.mkdir);

const initTempDir = async files => {
  const tempLocalSitePath = await makeTempDir("test-site");
  if (files) {
    await dirAsJson.writeJsonToDir(tempLocalSitePath, files);
  }
  return tempLocalSitePath;
};

module.exports = initTempDir;
