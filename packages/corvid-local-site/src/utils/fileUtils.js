const path = require("path");

const isUnderPath = (rootPath, pathToCheck) =>
  !path.relative(rootPath, pathToCheck).startsWith("..");

const isSamePath = (path1, path2) => path.relative(path1, path2) === "";

const getFileName = filePath => path.parse(filePath).name;

module.exports = {
  isUnderPath,
  isSamePath,
  getFileName
};
