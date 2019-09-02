const path = require("path");
const fs = require("fs-extra");

const isDirectory = async pathToCheck => {
  const stat = await fs.stat(pathToCheck);
  return stat.isDirectory();
};

const isEmptyDirectory = async pathToCheck => {
  if (!(await isDirectory(pathToCheck))) {
    return false;
  }
  const contents = await fs.readdir(pathToCheck);
  return contents.length === 0;
};

const isUnderPath = (rootPath, pathToCheck) =>
  !path.relative(rootPath, pathToCheck).startsWith("..");

const isSamePath = (path1, path2) => path.relative(path1, path2) === "";

const getFileName = filePath => path.parse(filePath).name;

const deleteEmptySubFolders = async rootPath => {
  if (await fs.exists(rootPath)) {
    const contents = await fs.readdir(rootPath);
    await Promise.all(
      contents.map(async subPath => {
        const fullPath = path.join(rootPath, subPath);
        const shouldDelete = await isEmptyDirectory(fullPath);
        return shouldDelete ? fs.remove(fullPath) : Promise.resolve();
      })
    );
  }
};

module.exports = {
  isUnderPath,
  isSamePath,
  getFileName,
  deleteEmptySubFolders
};
