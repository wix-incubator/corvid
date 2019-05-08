const fs = require("fs-extra");
const path = require("path");
const flat = require("flat");
const flatten = (data, delimiter = path.sep) =>
  flat(data, { delimiter, safe: true });

const readDirToJson = async (dirPath, options = {}) => {
  if (options.safe) {
    const doesDirExist = await fs.exists(dirPath);
    if (!doesDirExist) {
      return {};
    }
  }
  const dirFiles = await fs.readdir(dirPath);
  const result = await dirFiles.reduce(
    async (dirAsJsonPromise, relativePath) => {
      const fullPath = path.join(dirPath, relativePath);
      const stats = await fs.stat(fullPath);
      const dirAsJson = await dirAsJsonPromise;
      return Object.assign({}, dirAsJson, {
        [relativePath]: stats.isDirectory()
          ? await readDirToJson(fullPath, options)
          : options.readFiles === false
          ? null
          : await fs.readFile(fullPath, "utf8")
      });
    },
    {}
  );

  return options.delimiter ? flatten(result, options.delimiter) : result;
};

module.exports = readDirToJson;
