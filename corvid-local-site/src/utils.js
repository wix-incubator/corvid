const path = require("path");
const fs = require("fs-extra");
const rimraf = require("rimraf");
const sitePaths = require("./sitePaths");

const isEmptySite = async rootPath => {
  if (!(await fs.exists(rootPath))) false;
  const isFull = await Promise.all(
    sitePaths.siteFolders.map(
      async folder => await fs.exists(path.join(rootPath, folder))
    )
  );
  return !isFull.some(f => f);
};

const isSiteInitialized = async rootPath =>
  await fs.exists(path.join(rootPath, sitePaths.configFile));

const deleteFolder = folderPath =>
  new Promise(resolve => rimraf(folderPath, resolve));

const deleteWixSite = async rootPath => {
  await Promise.all(
    sitePaths.siteFolders.map(folder =>
      deleteFolder(path.join(rootPath, folder))
    )
  );
};

const moveWixSite = async rootPath => {
  const destFolder = `snapshots/${Date.now()}`;
  await fs.ensureDir(path.join(rootPath, destFolder));
  await Promise.all(
    sitePaths.siteFolders.map(folder => {
      return fs.move(
        path.join(rootPath, folder),
        path.join(rootPath, destFolder, folder)
      );
    })
  );
};

module.exports.isEmptySite = isEmptySite;
module.exports.isSiteInitialized = isSiteInitialized;
module.exports.moveWixSite = moveWixSite;
module.exports.deleteWixSite = deleteWixSite;
