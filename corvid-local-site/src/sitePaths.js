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

const sep = () => `${path.sep}`;
const getPageFileName = (id, title, extention = fileExtention) =>
  `${sanitize(removeSpaces(title), titleCharReplacement)}.${id}${extention}`;

const editorPageFileRegexpStr = `^${sep()}{0,1}public${sep()}pages`;
const matchEditorPageFile = filePath =>
  filePath.match(new RegExp(editorPageFileRegexpStr));

const localPageFileRegexpStr = `^${sep()}{0,1}frontend${sep()}(pages|lightboxes)${sep()}.*\\.([^.]*)\\.js`;
const matchLocalPageFile = filePath =>
  filePath.match(new RegExp(localPageFileRegexpStr));

const editorMasterPageFileRegexpStr = `^${sep()}{0,1}public${sep()}pages${sep()}masterPage.js`;
const matchEditorMasterPageFile = filePath =>
  filePath.match(new RegExp(editorMasterPageFileRegexpStr));

const localMasterPageFileRegexpStr = `^${sep()}{0,1}frontend${sep()}site.js`;
const matchLocalMasterPageFile = filePath =>
  filePath.match(new RegExp(localMasterPageFileRegexpStr));

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
  const matchesPage = matchLocalPageFile(filePath);
  if (matchLocalMasterPageFile(filePath)) {
    return `${publicFolder}${sep()}pages${sep()}masterPage.js`;
  }
  if (matchLocalPageFile(filePath)) {
    const [pageId] = matchesPage.slice(-1);
    return `${publicFolder}${sep()}pages${sep()}${pageId}${pageCodeExtention}`;
  }
  const matchesSchema = filePath.match(
    new RegExp(`^${sep()}{0,1}database${sep()}`)
  );
  if (matchesSchema) {
    return filePath.replace(
      new RegExp(`^${sep()}{0,1}database${sep()}`),
      `.schemas${sep()}`
    );
  }

  return filePath;
};

const toLocalCode = file => {
  if (matchEditorPageFile(file.path)) {
    if (matchEditorMasterPageFile(file.path)) {
      return `frontend${sep()}site.js`;
    }
    const {
      metaData: { pageId, isPopup, title }
    } = file;
    return isPopup
      ? lightboxes({ pageId, title }, pageCodeExtention)
      : pages({ pageId, title }, pageCodeExtention);
  }

  // eslint-disable-next-line no-useless-escape
  if (file.path.match(new RegExp(`^${sep()}{0,1}\.schemas`))) {
    return file.path.replace(
      new RegExp(`^${sep()}{0,1}.schemas${sep()}`),
      `database${sep()}`
    );
  }

  return file.path;
};

const fromPageFileToCodeFile = path =>
  path.replace(fileExtention, pageCodeExtention);

//todo:: isCodeFiles should ignore files that starts with a .
const isCodeFile = relativePath => !relativePath.endsWith(fileExtention);
const isDocumentFile = relativePath => relativePath.endsWith(fileExtention);
const getDocumentFolderRegex = fullPath =>
  `${fullPath}${sep()}**${sep()}*${fileExtention}`;

module.exports = {
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
