const path = require("path");
const fs = require("fs-extra");
const dirAsJson = require("corvid-dir-as-json");
const initTempDir = require("./initTempDir");

const siteSrcPath = rootPath => path.join(rootPath, "src");

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

  const corvidRcPath = path.join(rootDir, ".corvid", "corvidrc.json");
  await fs.ensureFile(corvidRcPath);
  await fs.writeFile(corvidRcPath, JSON.stringify({ metasiteId: 12345 }));

  await dirAsJson.writeJsonToDir(siteSrcPath(rootDir), localSiteFiles);
  return rootDir;
};

const cleanLocalSite = async rootPath => fs.remove(rootPath);

const initBackup = (rootPath, localSiteFiles) =>
  dirAsJson.writeJsonToDir(
    path.join(rootPath, ".corvid", "backup"),
    localSiteFiles
  );

module.exports = {
  doesExist,
  cleanLocalSite,
  initLocalSite,
  readLocalSite,
  writeFile,
  readFile,
  deleteFile,
  initBackup
};
