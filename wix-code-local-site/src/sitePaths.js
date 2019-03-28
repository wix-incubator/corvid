const path = require("path");
const get_ = require("lodash/get");
const isArray_ = require("lodash/isArray");
const sanitize = require("sanitize-filename");

const frontendFolder = "frontend";
const publicFolder = "public";
const backendFolder = "backend";
const fileExtention = ".wix";
const pageCodeExtention = ".js";
const titleCharReplacement = "_";
const codeFolders = {
  public: publicFolder,
  backend: backendFolder
};

const removeSpaces = string => string.replace(/\s/g, titleCharReplacement);

const getPageFileName = (id, title, extention = fileExtention) =>
  `${sanitize(removeSpaces(title), titleCharReplacement)}.${id}${extention}`;

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

const routers = (fileName = "") =>
  path.join(
    frontendFolder,
    "routers",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const menus = (fileName = "") =>
  path.join(
    frontendFolder,
    "menus",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const site = (fileName = "") =>
  path.join(
    frontendFolder,
    "site",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const fromLocalCode = filePath => {
  const match = filePath.match(
    /^frontend\/(pages|lightboxes)\/.*\.([^.]*)\.js/
  );
  if (isArray_(match)) {
    const [pageId] = match.slice(-1);
    return `${publicFolder}/pages/${pageId}${pageCodeExtention}`;
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
      ? lightboxes({ pageId, title }, pageCodeExtention)
      : pages({ pageId, title }, pageCodeExtention);
  } else {
    return file.path;
  }
};

//todo:: isCodeFiles should ignore files that starts with a .
const isCodeFile = relativePath => !relativePath.endsWith(fileExtention);
const isDocumentFile = relativePath => relativePath.endsWith(fileExtention);
const getDocumentFolderRegex = fullPath => `${fullPath}/**/*${fileExtention}`;
const siteFolders = [frontendFolder, publicFolder, backendFolder];
module.exports = {
  siteFolders,
  codeFolders,
  getDocumentFolderRegex,
  fromLocalCode,
  toLocalCode,
  fileExtention,
  isCodeFile,
  isDocumentFile,
  routers,
  menus,
  lightboxes,
  styles,
  pages,
  site
};
