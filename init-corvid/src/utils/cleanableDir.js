const fs = require("fs-extra");
const path = require("path");

const diff = (arr1, arr2) => arr1.filter(item => !arr2.includes(item));

const initCleanableDir = async rootPath => {
  const absPath = path.resolve(rootPath);

  const didDirectoryExistBefore = await fs.exists(absPath);
  await fs.ensureDir(absPath);
  const dirContentsBefore = await fs.readdir(absPath);

  return {
    clean: async () => {
      const directoryExists = fs.exists(absPath);
      if (!directoryExists) {
        return;
      }

      if (!didDirectoryExistBefore) {
        await fs.remove(absPath);
        return;
      }

      const dirContentsAfter = await fs.readdir(absPath);
      const generatedContents = diff(dirContentsAfter, dirContentsBefore);
      await Promise.all(
        generatedContents.map(item => fs.remove(path.join(absPath, item)))
      );
    }
  };
};

module.exports = initCleanableDir;
