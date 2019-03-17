const path = require("path");

const publicFolder = "public";
const fileExtention = ".wix";

const pages = (fileName = "") =>
  path.join(
    publicFolder,
    "pages",
    fileName ? `${fileName}${fileExtention}` : ""
  );
const styles = (fileName = "") =>
  path.join(
    publicFolder,
    "styles",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const site = (fileName = "") =>
  path.join(
    publicFolder,
    "site",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const lightboxes = (fileName = "") =>
  path.join(
    publicFolder,
    "lightboxes",
    fileName ? `${fileName}${fileExtention}` : ""
  );
const extraData = () => path.join(publicFolder, `extraData${fileExtention}`);
const code = filePath => filePath;

const isCodeFile = relativePath => !relativePath.endsWith(".wix");

module.exports = {
  fileExtention,
  isCodeFile,
  extraData,
  lightboxes,
  styles,
  pages,
  site,
  code
};
