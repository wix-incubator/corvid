const path = require("path");
const get_ = require("lodash/get");
const isArray_ = require("lodash/isArray");
const sanitize = require("sanitize-filename");

const frontendFolder = "frontend";
const publicFolder = "public";
const backendFolder = "backend";
const databaseFolder = "database";
const fileExtention = ".wix";
const pageCodeExtention = ".js";
const titleCharReplacement = "_";
const codeFolders = {
  public: publicFolder,
  backend: backendFolder,
  database: databaseFolder
};
const siteFolders = [
  frontendFolder,
  publicFolder,
  backendFolder,
  databaseFolder
];
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
  const matchesPage = filePath.match(
    /^\/{0,1}frontend\/(pages|lightboxes)\/.*\.([^.]*)\.js/
  );
  if (isArray_(matchesPage)) {
    const [pageId] = matchesPage.slice(-1);
    return `${publicFolder}/pages/${pageId}${pageCodeExtention}`;
  }
  const matchesSchema = filePath.match(/^\/{0,1}database\//);
  if (matchesSchema) {
    return filePath.replace(/^\/{0,1}database\//, ".schemas/");
  }

  return filePath;
};

const toLocalCode = file => {
  if (file.path.match(/^\/{0,1}public\/pages/)) {
    const {
      metaData: { pageId, isPopUp, pageTitle: title }
    } = file;
    return isPopUp
      ? lightboxes({ pageId, title }, pageCodeExtention)
      : pages({ pageId, title }, pageCodeExtention);
  }
  if (file.path.match(/^\/{0,1}\.schemas/)) {
    return file.path.replace(/^\/{0,1}.schemas\//, "database/");
  }

  return file.path;
};

//todo:: isCodeFiles should ignore files that starts with a .
const isCodeFile = relativePath => !relativePath.endsWith(fileExtention);
const isDocumentFile = relativePath => relativePath.endsWith(fileExtention);
const getDocumentFolderRegex = fullPath => `${fullPath}/**/*${fileExtention}`;

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
