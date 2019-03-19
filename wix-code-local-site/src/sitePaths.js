const path = require("path");

const frontendFolder = "frontend";
const fileExtention = ".wix";

const pages = (fileName = "") =>
  path.join(
    frontendFolder,
    "pages",
    fileName ? `${fileName}${fileExtention}` : ""
  );
const styles = (fileName = "") =>
  path.join(
    frontendFolder,
    "styles",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const site = (fileName = "") =>
  path.join(
    frontendFolder,
    "site",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const lightboxes = (fileName = "") =>
  path.join(
    frontendFolder,
    "lightboxes",
    fileName ? `${fileName}${fileExtention}` : ""
  );
const extraData = () => path.join(frontendFolder, `extraData${fileExtention}`);

const fromLocalCode = filePath =>
  filePath.replace(/^frontend\/pages\//, "public/pages/");
const toLocalCode = filePath =>
  filePath.replace(/^public\/pages\//, "frontend/pages/");

const isCodeFile = relativePath => !relativePath.endsWith(fileExtention);
const isDocumentFile = relativePath => relativePath.endsWith(fileExtention);
const getDocumentFolderRegex = fullPath => `${fullPath}/**/*${fileExtention}`;

module.exports = {
  getDocumentFolderRegex,
  fromLocalCode,
  toLocalCode,
  fileExtention,
  isCodeFile,
  isDocumentFile,
  extraData,
  lightboxes,
  styles,
  pages,
  site
};
