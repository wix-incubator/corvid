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

const isEditorPageCodePath = filePath =>
  !!filePath.match(/^\/{0,1}public\/pages/);

const matchLocalPageCodePath = filePath =>
  filePath.match(
    /^\/{0,1}frontend\/(pages|lightboxes)\/.*\.(?<pageId>[^.]*)\.js/
  );

const isEditorMasterPageCodePath = filePath =>
  !!filePath.match(/^\/{0,1}public\/pages\/masterPage.js/);

const isLocalMsterPageCodePath = filePath =>
  !!filePath.match(/^\/{0,1}frontend\/site.js/);

const isEditorDatabaseSchemaPath = isEditorDatabaseSchemaPath =>
  !!isEditorDatabaseSchemaPath.match(/^\/{0,1}\.schemas/);

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
  if (isLocalMsterPageCodePath(filePath)) {
    return `${publicFolder}/pages/masterPage.js`;
  }
  const localPageCodeMatches = matchLocalPageCodePath(filePath);
  if (localPageCodeMatches) {
    const pageId = localPageCodeMatches.groups.pageId;
    return `${publicFolder}/pages/${pageId}${pageCodeExtention}`;
  }
  const matchesSchema = filePath.match(/^\/{0,1}database\//);
  if (matchesSchema) {
    return filePath.replace(/^\/{0,1}database\//, ".schemas/");
  }

  return filePath;
};

const toLocalCode = ({ path, metaData = {} }) => {
  if (isEditorMasterPageCodePath(path)) {
    return "frontend/site.js";
  }

  if (isEditorPageCodePath(path)) {
    const { pageId, isPopup, title } = metaData;
    return isPopup
      ? lightboxes({ pageId, title }, pageCodeExtention)
      : pages({ pageId, title }, pageCodeExtention);
  }

  if (isEditorDatabaseSchemaPath(path)) {
    return path.replace(/^\/{0,1}.schemas\//, "database/");
  }

  return path;
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
  site,
  isEditorDatabaseSchemaPath
};
