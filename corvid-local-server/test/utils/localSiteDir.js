const path = require("path");
const fs = require("fs-extra");
const dirAsJson = require("corvid-dir-as-json");
const { initTempDir, siteCreators: sc } = require("corvid-local-test-utils");
const { localSiteBuilder } = require("corvid-local-site/testkit");

const initLocalSiteWithConfig = (
  config = localSiteBuilder.buildPartial(sc.corvidrc())
) => initTempDir(config);

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
  initLocalSiteWithConfig,
  initLocalSite: initTempDir,
  readLocalSite,
  writeFile,
  deleteFile
};
