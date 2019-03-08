const util = require("util");
const temp = require("temp").track();
const dirAsJson = require("@wix/dir-as-json");

const makeTempDir = util.promisify(temp.mkdir);

const initLocalSite = async localSiteFiles => {
  const tempLocalSitePath = await makeTempDir("test-site");
  await dirAsJson.writeJsonToDir(tempLocalSitePath, localSiteFiles);
  return tempLocalSitePath;
};

const readLocalSite = async localSitePath =>
  dirAsJson.readDirToJson(localSitePath);

module.exports = {
  initLocalSite,
  readLocalSite
};
