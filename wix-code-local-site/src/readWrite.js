const fs = require("fs-extra");
const path = require("path");
const sitePaths = require("./sitePaths");

const readWrite = (siteRootPath, filesWatcher) => {
  const getCodeFiles = async (dirPath = siteRootPath) => {
    const dirFiles = await fs.readdir(dirPath);
    const isCodeFile = fullPath => {
      return path
        .relative(path.join(siteRootPath, sitePaths.pagesPath), fullPath)
        .startsWith("..");
    };
    const getCodeFile = async fullPath =>
      isCodeFile(fullPath)
        ? {
            [path.relative(siteRootPath, fullPath)]: await fs.readFile(
              fullPath,
              "utf8"
            )
          }
        : {};
    return dirFiles.reduce(async (dirAsJsonPromise, relativePath) => {
      const fullPath = path.join(dirPath, relativePath);
      const stats = await fs.stat(fullPath);
      const dirAsJson = await dirAsJsonPromise;
      return Object.assign(
        {},
        dirAsJson,
        stats.isDirectory()
          ? await getCodeFiles(fullPath)
          : await getCodeFile(fullPath)
      );
    }, {});
  };

  const updateDocument = async newDocument => {
    const newPages = newDocument.pages;
    if (newPages) {
      const newPageWrites = Object.keys(newPages).map(pageId => {
        return filesWatcher.ignoredWriteFile(
          sitePaths.page(pageId),
          newPages[pageId]
        );
      });
      await Promise.all(newPageWrites);
    }
  };

  const fullPath = filePath => path.resolve(siteRootPath, filePath);

  const modifyFile = (content, filePath) => {
    const fullFilePath = fullPath(filePath);
    fs.ensureDirSync(path.dirname(fullFilePath));
    return fs.writeFile(fullFilePath, content);
  };

  const copyFile = ({ sourcePath, targetPath }) =>
    fs.copyFile(fullPath(sourcePath), fullPath(targetPath));
  const deleteFile = filePath => fs.unlink(fullPath(filePath));

  const getDocument = async () => {
    const pages = await fs.readdir(
      path.join(siteRootPath, sitePaths.pagesPath)
    );
    return pages.reduce(async (dirAsJsonPromise, relativePath) => {
      const fullPath = path.join(
        siteRootPath,
        sitePaths.pagesPath,
        relativePath
      );
      // todo:: change to response payloaddd
      return Object.assign(
        {},
        {
          public: {
            pages: {
              [relativePath]: await fs.readFile(fullPath, "utf8")
            }
          }
        }
      );
    }, {});
  };

  const updateCode = async updateRequest => {
    const { modifiedFiles, copiedFiles, deletedFiles } = updateRequest;
    try {
      let updatePromises = [];
      updatePromises = Object.keys(modifiedFiles).map(filePath =>
        modifyFile(modifiedFiles[filePath], filePath)
      );
      updatePromises = updatePromises.concat(copiedFiles.forEach(copyFile));
      updatePromises = updatePromises.concat(deletedFiles.forEach(deleteFile));
      await Promise.all(updatePromises);
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("files save error", error);
      return { success: false, error };
    }
  };

  return {
    updateDocument,
    getCode: async () => {
      const result = {
        modifiedFiles: await getCodeFiles(),
        copiedFiles: [],
        deletedFiles: []
      };
      return result;
    },
    getDocument,
    updateCode
  };
};

module.exports = readWrite;
