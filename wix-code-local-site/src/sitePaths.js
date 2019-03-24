const path = require("path");
const get_ = require("lodash/get");
const isArray_ = require("lodash/isArray");

const frontendFolder = "frontend";
const fileExtention = ".wix";
const codeExtention = ".js";

const removeIllegalChars = (str, replaceTo = "_") =>
  str.replace(/[/\\?%*:|"<>\s]/g, replaceTo);

const getPageFileName = (id, title, extention = fileExtention) =>
  `${removeIllegalChars(title)}.${id}${extention}`;

const pages = (page = null, extention = fileExtention) =>
  path.join(
    frontendFolder,
    "pages",
    page
      ? getPageFileName(get_(page, "pageId"), get_(page, "title"), extention)
      : ""
  );

const lightboxes = (page = null, extention = fileExtention) =>
  path.join(
    frontendFolder,
    "lightboxes",
    page
      ? getPageFileName(get_(page, "pageId"), get_(page, "title"), extention)
      : ""
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

const misc = () => path.join(frontendFolder, `misc${fileExtention}`);

const fromLocalCode = filePath => {
  const match = filePath.match(
    /^frontend\/(pages|lightboxes)\/.*\.([^.]*)\.js/
  );
  if (isArray_(match)) {
    const [pageId] = match.slice(-1);
    return `public/pages/${pageId}${codeExtention}`;
  } else {
    return filePath;
  }
};

const toLocalCode = file => {
  const {
    metaData: { pageId, isPopUp, pageTitle: title }
  } = file;
  if (pageId) {
    return isPopUp
      ? lightboxes({ pageId, title }, codeExtention)
      : pages({ pageId, title }, codeExtention);
  } else {
    return file.path;
  }
};

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
