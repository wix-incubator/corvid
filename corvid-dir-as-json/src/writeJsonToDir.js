const fs = require("fs-extra");
const path = require("path");

const isDirectoryJson = obj => typeof obj === "object";

const writeJsonToDir = async (dirPath, dirAsJson = {}) => {
  await fs.ensureDir(dirPath);
  await Promise.all(
    Object.keys(dirAsJson).map(relativePath => {
      const pathContent = dirAsJson[relativePath];
      const fullPath = path.join(dirPath, relativePath);
      return isDirectoryJson(pathContent)
        ? writeJsonToDir(fullPath, pathContent)
        : fs.writeFile(fullPath, pathContent);
    })
  );
};

module.exports = writeJsonToDir;
