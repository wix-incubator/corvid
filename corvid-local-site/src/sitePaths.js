const path = require("path");
const get_ = require("lodash/get");
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

const isSitePath = (rootPath, pathToCheck) => {
  const pathRelativeToRoot = path.relative(rootPath, pathToCheck);
  if (pathRelativeToRoot === "") {
    return true;
  }
  return siteFolders.includes(pathRelativeToRoot.split(path.sep)[0]);
};

const getPageFileName = (id, title, extention = fileExtention) =>
  `${sanitize(removeSpaces(title), titleCharReplacement)}.${id}${extention}`;

const matchEditorPageFile = filePath => filePath.match(/^\/{0,1}public\/pages/);

const matchLocalPageFile = filePath =>
  filePath.match(/^\/{0,1}frontend\/(pages|lightboxes)\/.*\.([^.]*)\.js/);

const matchEditorMasterPageFile = filePath =>
  filePath.match(/^\/{0,1}public\/pages\/masterPage.js/);

const matchLocalMasterPageFile = filePath =>
  filePath.match(/^\/{0,1}frontend\/site.js/);

const pages = (page = null, extention = fileExtention) =>
  path.posix.join(
    frontendFolder,
    "pages",
    page
      ? getPageFileName(get_(page, "pageId"), get_(page, "title"), extention)
      : ""
  );

const lightboxes = (page = null, extention = fileExtention) =>
  path.posix.join(
    frontendFolder,
    "lightboxes",
    page
      ? getPageFileName(get_(page, "pageId"), get_(page, "title"), extention)
      : ""
  );

const styles = (fileName = "") =>
  path.posix.join(
    frontendFolder,
    "styles",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const routers = (fileName = "") =>
  path.posix.join(
    frontendFolder,
    "routers",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const menus = (fileName = "") =>
  path.posix.join(
    frontendFolder,
    "menus",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const site = (fileName = "") =>
  path.posix.join(
    frontendFolder,
    "site",
    fileName ? `${fileName}${fileExtention}` : ""
  );

const fromLocalCode = filePath => {
  const matchesPage = matchLocalPageFile(filePath);
  if (matchLocalMasterPageFile(filePath)) {
    return `${publicFolder}/pages/masterPage.js`;
  }
  if (matchLocalPageFile(filePath)) {
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
  if (matchEditorPageFile(file.path)) {
    if (matchEditorMasterPageFile(file.path)) {
      return "frontend/site.js";
    }
    const {
      metaData: { pageId, isPopup, title }
    } = file;
    return isPopup
      ? lightboxes({ pageId, title }, pageCodeExtention)
      : pages({ pageId, title }, pageCodeExtention);
  }
  if (file.path.match(/^\/{0,1}\.schemas/)) {
    return file.path.replace(/^\/{0,1}.schemas\//, "database/");
  }

  return file.path;
};

const fromPageFileToCodeFile = path =>
  path.replace(fileExtention, pageCodeExtention);

//todo:: isCodeFiles should ignore files that starts with a .
const isCodeFile = relativePath => !relativePath.endsWith(fileExtention);
const isDocumentFile = relativePath => relativePath.endsWith(fileExtention);
const getDocumentFolderRegex = fullPath => `${fullPath}/**/*${fileExtention}`;

module.exports = {
  isSitePath,
  siteFolders,
  codeFolders,
  getDocumentFolderRegex,
  fromPageFileToCodeFile,
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
