const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const temp = require("temp").track();
const dirAsJson = require("dir-as-json");

const makeTempDir = util.promisify(temp.mkdir);

const initLocalSite = async localSiteFiles => {
  const tempLocalSitePath = await makeTempDir("test-site");
  await dirAsJson.writeJsonToDir(tempLocalSitePath, localSiteFiles);
  return tempLocalSitePath;
};

const readLocalSite = localSitePath => dirAsJson.readDirToJson(localSitePath);

const writeFile = async (localSitePath, filePath, content) => {
  const fullPath = path.join(localSitePath, filePath);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content);
};

const deleteFile = async (localSitePath, filePath) => {
  const fullPath = path.join(localSitePath, filePath);
  await fs.unlink(fullPath);
};

const isFolderExsist = async (localSitePath, folderPath) =>
  await fs.exists(path.join(localSitePath, folderPath));

module.exports = {
  isFolderExsist,
  initLocalSite,
  readLocalSite,
  writeFile,
  deleteFile
};
