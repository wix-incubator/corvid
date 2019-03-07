const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

module.exports = basePath => {
  const fullPath = filePath => path.resolve(basePath, filePath);

  const modifyFile = (content, filePath) => {
    const fullFilePath = fullPath(filePath);
    fs.ensureDirSync(path.dirname(fullFilePath));
    fs.writeFileSync(fullFilePath, content);
  };

  const copyFile = ({ sourcePath, targetPath }) => {
    fs.copyFileSync(fullPath(sourcePath), fullPath(targetPath));
  };

  const deleteFile = filePath => {
    fs.unlinkSync(fullPath(filePath));
  };

  const save = data => {
    const { modifiedFiles, copiedFiles, deletedFiles } = data;
    // todo prepare some backup of current files state
    try {
      _.forIn(modifiedFiles, modifyFile);
      copiedFiles.forEach(copyFile);
      deletedFiles.forEach(deleteFile);
      return { success: true };
    } catch (error) {
      // todo do some revert
      console.log("files save error", error); // eslint-disable-line no-console
      return { success: false, error };
    }
  };
  const get = (currentPath = basePath) => {
    let result = {};
    if (fs.lstatSync(currentPath).isDirectory()) {
      fs.readdirSync(currentPath).forEach(
        itemName =>
          (result = Object.assign(
            {},
            result,
            get(path.resolve(currentPath, itemName))
          ))
      );
    } else {
      result = Object.assign({}, result, {
        [path.relative(basePath, currentPath)]: fs.readFileSync(
          currentPath,
          "utf8"
        )
      });
    }
    return result;
  };
  return {
    save,
    get
  };
};
