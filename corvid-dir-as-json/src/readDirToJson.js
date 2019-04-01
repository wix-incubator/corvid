const fs = require("fs-extra");
const path = require("path");

const readDirToJson = async dirPath => {
  const dirFiles = await fs.readdir(dirPath);
  return dirFiles.reduce(async (dirAsJsonPromise, relativePath) => {
    const fullPath = path.join(dirPath, relativePath);
    const stats = await fs.stat(fullPath);
    const dirAsJson = await dirAsJsonPromise;
    return Object.assign({}, dirAsJson, {
      [relativePath]: stats.isDirectory()
        ? await readDirToJson(fullPath)
        : await fs.readFile(fullPath, "utf8")
    });
  }, {});
};

module.exports = readDirToJson;
