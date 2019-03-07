const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const rimraf = require("rimraf");
const _ = require("lodash");

const getBasePath = () => path.resolve(os.tmpdir(), "testDir");
const clearBasePath = (callback = _.noop) => rimraf(getBasePath(), callback);
const fileExists = relativePath =>
  fs.existsSync(path.resolve(getBasePath(), relativePath));
const fileContent = relativePath =>
  fs.readFileSync(path.resolve(getBasePath(), relativePath), "utf8");
const createFile = (relativePath, content) =>
  fs.writeFileSync(path.resolve(getBasePath(), relativePath), content);
const deleteFile = relativePath =>
  fs.unlinkSync(path.resolve(getBasePath(), relativePath));
const createBasePath = () => fs.ensureDirSync(getBasePath());

const defaultDirectoryStructure = {
  modifiedFiles: {
    "backend/authorization-config.json": 'console.log("authorization-config")',
    "backend/routers.json": 'console.log("routers")',
    "public/public-code-file-1.js": 'console.log("public-code-file-1")',
    "public/public-code-file-2.js": 'console.log("public-code-file-2")'
  },
  copiedFiles: [],
  deletedFiles: []
};
module.exports = {
  watcher: {
    createBasePath,
    createFile,
    deleteFile
  },
  filesManager: {
    fileExists,
    fileContent,
    defaultDirectoryStructure
  },
  getBasePath,
  clearBasePath
};
