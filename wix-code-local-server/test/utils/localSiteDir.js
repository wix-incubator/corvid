const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const temp = require("temp").track();
const dirAsJson = require("@wix/dir-as-json");

const makeTempDir = util.promisify(temp.mkdir);

const initLocalSite = async localSiteFiles => {
  const tempLocalSitePath = await makeTempDir("test-site");
  // console.log("tempLocalSitePath", tempLocalSitePath);
  await dirAsJson.writeJsonToDir(tempLocalSitePath, localSiteFiles);
  return tempLocalSitePath;
};

const readLocalSite = async localSitePath =>
  dirAsJson.readDirToJson(localSitePath);

const writeFile = async (localSitePath, filePath, content) => {
  const fullPath = path.join(localSitePath, filePath);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content);
};

const deleteFile = async (localSitePath, filePath) => {
  const fullPath = path.join(localSitePath, filePath);
  await fs.unlink(fullPath);
};

module.exports = {
  initLocalSite,
  readLocalSite,
  writeFile,
  deleteFile
};
