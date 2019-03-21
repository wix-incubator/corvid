const path = require("path");
const get_ = require("lodash/get");

const frontendFolder = "frontend";
const fileExtention = ".wix";

const removeIllegalChars = (str, replaceTo = "_") =>
  str.replace(/[/\\?%*:|"<>\s]/g, replaceTo);

const getPageFileName = (id, title) =>
  `${removeIllegalChars(title)}.${id}${fileExtention}`;

const pages = (page = null) =>
  path.join(
    frontendFolder,
    "pages",
    page ? getPageFileName(get_(page, "pageId"), get_(page, "title")) : ""
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

const lightboxes = (page = null) =>
  path.join(
    frontendFolder,
    "lightboxes",
    page ? getPageFileName(get_(page, "pageId"), get_(page, "title")) : ""
  );

const misc = () => path.join(frontendFolder, `misc${fileExtention}`);

const fromLocalCode = filePath =>
  filePath.replace(/^frontend\/(pages|lightboxes)\//, "public/pages/");

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
  misc,
  lightboxes,
  styles,
  pages,
  site
};
