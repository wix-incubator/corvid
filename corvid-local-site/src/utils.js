const path = require("path");
const fs = require("fs-extra");
const sitePaths = require("./sitePaths");

const copyDir = async (src, dest) => {
  await fs.ensureDir(dest);
  const files = await fs.readdir(src);

  files.forEach(async f => {
    const fileStat = await fs.stat(path.join(src, f));
    const srcPath = path.join(src, f);
    const destPath = path.join(dest, f);
    if (fileStat.isDirectory()) {
      await copyDir(srcPath, destPath);
    }
    if (fileStat.isSymbolicLink()) {
      const symlink = await fs.readlink(srcPath);
      await fs.symlink(symlink, destPath);
    } else {
      await fs.ensureFile(destPath);
      await fs.writeFile(destPath, await fs.read(srcPath));
    }
  });
};

const isFullWixSite = async rootPath => {
  if (!(await fs.exists(rootPath))) false;
  const isFull = await Promise.all(
    sitePaths.siteFolders.map(
      async folder => await fs.exists(path.join(rootPath, folder))
    )
  );
  return isFull.some(f => f);
};

const isWixFolder = async rootPath =>
  await fs.exists(path.join(rootPath, sitePaths.configFile));

const deleteWixSite = async rootPath => {
  sitePaths.siteFolders.forEach(async folder => {
    const fullPath = path.join(rootPath, folder);
    if (await fs.exists(fullPath)) await fs.unlink(fullPath);
  });
};

const moveWixSite = async rootPath => {
  const destFolder = `snapshot/${Date.parse(new Date())}`;
  sitePaths.siteFolders.forEach(async folder => {
    await copyDir(
      path.join(rootPath, folder),
      path.join(rootPath, destFolder, folder)
    );
  });
  await deleteWixSite(rootPath);
};

module.exports.isFullWixSite = isFullWixSite;
module.exports.isWixFolder = isWixFolder;
module.exports.moveWixSite = moveWixSite;
module.exports.deleteWixSite = deleteWixSite;
