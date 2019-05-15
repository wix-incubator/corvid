const path = require("path");
const fs = require("fs-extra");
const dirAsJson = require("corvid-dir-as-json");
const { initTempDir } = require("corvid-local-test-utils");
const { backupsPath } = require("corvid-local-site/src/sitePaths");

const siteSrcPath = rootPath => path.join(rootPath, "src");
const siteBackupsPath = rootPath =>
  path.join(siteSrcPath(rootPath), backupsPath);

const readLocalSite = rootPath =>
  dirAsJson.readDirToJson(siteSrcPath(rootPath));

const writeFile = async (rootPath, filePath, content) => {
  const fullPath = path.join(siteSrcPath(rootPath), filePath);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content);
};

const readFile = async (rootPath, filePath) => {
  const fullPath = path.join(siteSrcPath(rootPath), filePath);
  return fs.readFile(fullPath, "utf8");
};

const deleteFile = async (rootPath, filePath) => {
  const fullPath = path.join(siteSrcPath(rootPath), filePath);
  await fs.unlink(fullPath);
};

const doesExist = async (rootPath, localPath) =>
  await fs.exists(path.join(siteSrcPath(rootPath), localPath));

const initLocalSite = async (localSiteFiles, createdRoodDir) => {
  const rootDir = createdRoodDir || (await initTempDir());
  await fs.writeFile(
    path.join(rootDir, ".corvidrc.json"),
    JSON.stringify({ metasiteId: 12345 })
  );
  await dirAsJson.writeJsonToDir(siteSrcPath(rootDir), localSiteFiles);
  return rootDir;
};

const initBackup = (localSiteFiles, rootDir) =>
  dirAsJson.writeJsonToDir(siteBackupsPath(rootDir), localSiteFiles);

module.exports = {
  doesExist,
  initLocalSite,
  readLocalSite,
  writeFile,
  readFile,
  deleteFile,
  initBackup
};
