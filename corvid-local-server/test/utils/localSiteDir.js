const path = require("path");
const fs = require("fs-extra");
const dirAsJson = require("corvid-dir-as-json");
const { initTempDir } = require("corvid-local-test-utils");

const siteSrcPath = rootPath => path.join(rootPath, "src");

const readLocalSite = rootPath =>
  dirAsJson.readDirToJson(siteSrcPath(rootPath));

const writeFile = async (rootPath, filePath, content) => {
  const fullPath = path.join(siteSrcPath(rootPath), filePath);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content);
};

const deleteFile = async (rootPath, filePath) => {
  const fullPath = path.join(siteSrcPath(rootPath), filePath);
  await fs.unlink(fullPath);
};

const isFolderExsist = async (rootPath, folderPath) =>
  await fs.exists(path.join(siteSrcPath(rootPath), folderPath));

const initLocalSite = async localSiteFiles => {
  const rootDir = await initTempDir();
  await fs.writeFile(
    path.join(rootDir, ".corvidrc.json"),
    JSON.stringify({ metasiteId: 12345 })
  );
  await dirAsJson.writeJsonToDir(siteSrcPath(rootDir), localSiteFiles);
  return rootDir;
};

module.exports = {
  isFolderExsist,
  initLocalSite,
  readLocalSite,
  writeFile,
  deleteFile
};
