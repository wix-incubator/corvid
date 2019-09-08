/* eslint-disable no-useless-escape */

const path = require("path").posix;
const values_ = require("lodash/values");
const sanitize = require("sanitize-filename");

const { isUnderPath } = require("./utils/fileUtils");

const ROOT_PATHS = {
  BACKEND: "backend",
  PUBLIC: "public",
  DATABASE: "database",

  PAGES: "pages",
  LIGHTBOXES: "lightboxes",
  STYLES: `assets/styles`,
  SITE: `assets/site`,
  ROUTERS: `assets/routers`,
  MENUS: `assets/menus`
};

const DEFAULT_FILE_PATHS = {
  METADATA: ".metadata.json",
  SITE_CODE: "pages/site.js",
  PACKAGE_JSON: "corvid-package.json"
};

const isPathRelatedToSite = (rootSitePath, fullPathToCheck) =>
  values_(ROOT_PATHS)
    .concat(values_(DEFAULT_FILE_PATHS))
    .some(siteSubFolder => {
      const fullSiteSubFolder = path.join(rootSitePath, siteSubFolder);
      return (
        isUnderPath(fullSiteSubFolder, fullPathToCheck) ||
        isUnderPath(fullPathToCheck, fullSiteSubFolder)
      );
    });

const matchLocalPageFile = extension => filePath => {
  const matches = filePath.match(
    new RegExp(
      `^(?<root>${ROOT_PATHS.PAGES}|${
        ROOT_PATHS.LIGHTBOXES
      })\/(?<title>[^\/]*)\\.(?<pageId>[^.\/]*).${extension}`
    )
  );
  return matches
    ? {
        pageId: matches.groups.pageId,
        title: matches.groups.title,
        isPopup: matches.groups.root === ROOT_PATHS.LIGHTBOXES
      }
    : null;
};

const matchLocalPageCodePath = matchLocalPageFile("js");
const matchLocalPageDocumentPath = matchLocalPageFile("wix");

const isPathOfPageCode = (localFilePath, pageId = null) => {
  const match = matchLocalPageCodePath(localFilePath);
  return pageId ? match && match.pageId === pageId : !!match;
};

const isPathOfPageStructure = (localFilePath, pageId = null) => {
  const match = matchLocalPageDocumentPath(localFilePath);
  return pageId ? match && match.pageId === pageId : !!match;
};

const isPathOfPageFile = (localFilePath, pageId = null) =>
  isPathOfPageCode(localFilePath, pageId) ||
  isPathOfPageStructure(localFilePath, pageId);

const isPathOfWixFile = relativePath => path.extname(relativePath) === ".wix";

const isMetadataFilePath = filePath => filePath === DEFAULT_FILE_PATHS.METADATA;

const isPathOfDocumentFile = relativePath =>
  isPathOfWixFile(relativePath) || isMetadataFilePath(relativePath);

const isPathOfCodeFile = relativePath =>
  isUnderPath(ROOT_PATHS.BACKEND, relativePath) ||
  isUnderPath(ROOT_PATHS.PUBLIC, relativePath) ||
  isUnderPath(ROOT_PATHS.DATABASE, relativePath) ||
  relativePath === DEFAULT_FILE_PATHS.SITE_CODE ||
  relativePath === DEFAULT_FILE_PATHS.PACKAGE_JSON ||
  isPathOfPageCode(relativePath);

const stylesFilePath = name => path.join(ROOT_PATHS.STYLES, `${name}.wix`);

const sitePartFilePath = name => path.join(ROOT_PATHS.SITE, `${name}.wix`);

const routerFilePath = prefix => path.join(ROOT_PATHS.ROUTERS, `${prefix}.wix`);

const menuFilePath = menuId => path.join(ROOT_PATHS.MENUS, `${menuId}.wix`);

const removeSpaces = string => string.replace(/\s/g, "_");

const sanitizePageTitle = pageTitle => sanitize(removeSpaces(pageTitle));

const pageFilePath = ({ pageId, title, isPopup, extension }) => {
  const pageOrLightboxRoot = isPopup ? ROOT_PATHS.LIGHTBOXES : ROOT_PATHS.PAGES;
  const sanitizedTitle = sanitizePageTitle(title);
  return path.join(
    pageOrLightboxRoot,
    `${sanitizedTitle}.${pageId}.${extension}`
  );
};

const pageStructureFilePath = ({ pageId, title, isPopup }) =>
  pageFilePath({ pageId, title, isPopup, extension: "wix" });

const pageCodeFilePath = ({ pageId, title, isPopup }) =>
  pageFilePath({ pageId, title, isPopup, extension: "js" });

const isPathOfEmptyByDefaultCodeFile = localFilePath =>
  isPathOfPageCode(localFilePath) ||
  [DEFAULT_FILE_PATHS.PACKAGE_JSON, DEFAULT_FILE_PATHS.SITE_CODE].includes(
    localFilePath
  );

module.exports = {
  ROOT_PATHS,
  DEFAULT_FILE_PATHS,

  stylesFilePath,
  sitePartFilePath,
  menuFilePath,
  routerFilePath,
  pageStructureFilePath,
  pageCodeFilePath,

  isPathRelatedToSite,
  isPathOfCodeFile,
  isPathOfDocumentFile,
  isPathOfWixFile,
  isPathOfPageFile,
  isPathOfPageCode,
  isPathOfPageStructure,
  isPathOfEmptyByDefaultCodeFile,

  matchLocalPageDocumentPath,
  matchLocalPageCodePath
};
