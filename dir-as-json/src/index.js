const fs = require("fs-extra");
const path = require("path");

const isDirectoryJson = obj => typeof obj === "object";

const flattenFilesDir = (dirAsJson, rootPath = "") =>
  Object.keys(dirAsJson).reduce((flattened, relativePath) => {
    const fullPath = path.join(rootPath, relativePath);
    const content = dirAsJson[relativePath];
    return Object.assign(
      {},
      flattened,
      isDirectoryJson(content)
        ? flattenFilesDir(content, fullPath)
        : {
            [fullPath]: content
          }
    );
  }, {});

const ensureWriteFile = async (path, content) => {
  await fs.ensureFile(path);
  await fs.writeFile(path, content);
};

const writeJsonToDir = async (dirPath, dirAsJson = {}) => {
  const files = flattenFilesDir(dirAsJson);
  await Promise.all(
    Object.keys(files).map(relativePath =>
      ensureWriteFile(path.join(dirPath, relativePath), files[relativePath])
    )
  );
  return dirPath;
};

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

module.exports.writeJsonToDir = writeJsonToDir;
module.exports.readDirToJson = readDirToJson;
