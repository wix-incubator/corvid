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
  MENUS: `assets/menus`,
  SITE_CODE: "pages/site",

  METADATA_FILE: ".metadata.json",
  SITE_CODE_FILE: "pages/site/site.js",
  PACKAGE_JSON_FILE: "corvid-package.json"
};

const TS_CONFIG_NAME = "tsconfig.json";

const isPathRelatedToSite = (rootSitePath, fullPathToCheck) =>
  values_(ROOT_PATHS).some(siteSubFolder => {
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
      })\/(?<folderTitle>[^\/]*)\\.(?<pageId>[^.\/]*)\/(?<fileNameTitle>[^\/]*).${extension}`
    )
  );
  return matches && matches.groups.fileNameTitle === matches.groups.folderTitle
    ? {
        pageId: matches.groups.pageId,
        title: matches.groups.fileName,
        isPopup: matches.groups.root === ROOT_PATHS.LIGHTBOXES
      }
    : null;
};

const matchLocalPageTsConfigFile = filePath => {
  const matches = filePath.match(
    new RegExp(
      `^(?<root>${ROOT_PATHS.PAGES}|${
        ROOT_PATHS.LIGHTBOXES
      })\/(?<folderTitle>[^\/]*)\\.(?<pageId>[^.\/]*)\/tsconfig.json`
    )
  );
  return matches
    ? {
        pageId: matches.groups.pageId
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
  isPathOfPageStructure(localFilePath, pageId) ||
  isPathOfPageTsConfigFile(localFilePath, pageId);

const isPathOfWixFile = relativePath => path.extname(relativePath) === ".wix";

const isPathOfPageTsConfigFile = (localFilePath, pageId = null) => {
  const match = matchLocalPageTsConfigFile(localFilePath);
  return pageId ? match && match.pageId === pageId : !!match;
};

const isPathOfBackendCodeFile = relativePath =>
  isUnderPath(ROOT_PATHS.BACKEND, relativePath) &&
  relativePath !== backendTsConfigFilePath();

const isPathOfPublicCodeFile = relativePath =>
  isUnderPath(ROOT_PATHS.PUBLIC, relativePath) &&
  relativePath !== publicTsConfigFilePath();

const isMetadataFilePath = filePath => filePath === ROOT_PATHS.METADATA_FILE;

const isPathOfDocumentFile = relativePath =>
  isPathOfWixFile(relativePath) || isMetadataFilePath(relativePath);

// add tests
const isPathOfCodeFile = relativePath =>
  isPathOfPageCode(relativePath) ||
  isPathOfBackendCodeFile(relativePath) ||
  isPathOfPublicCodeFile(relativePath) ||
  isUnderPath(ROOT_PATHS.DATABASE, relativePath) ||
  relativePath === ROOT_PATHS.SITE_CODE_FILE ||
  relativePath === ROOT_PATHS.PACKAGE_JSON_FILE;

const stylesFilePath = name => path.join(ROOT_PATHS.STYLES, `${name}.wix`);

const sitePartFilePath = name => path.join(ROOT_PATHS.SITE, `${name}.wix`);

const routerFilePath = prefix => path.join(ROOT_PATHS.ROUTERS, `${prefix}.wix`);

const menuFilePath = menuId => path.join(ROOT_PATHS.MENUS, `${menuId}.wix`);

const removeSpaces = string => string.replace(/\s/g, "_");

const sanitizePageTitle = pageTitle => sanitize(removeSpaces(pageTitle));

const pageFilePath = ({ pageId, title, isPopup, extension }) => {
  const pageOrLightboxRoot = isPopup ? ROOT_PATHS.LIGHTBOXES : ROOT_PATHS.PAGES;
  const sanitizedTitle = sanitizePageTitle(title);
  const pageSubFolder = `${pageOrLightboxRoot}/${sanitizedTitle}.${pageId}`;
  const pageFileName = `${sanitizedTitle}.${extension}`;
  return path.join(pageSubFolder, pageFileName);
};

const pageStructureFilePath = ({ pageId, title, isPopup }) =>
  pageFilePath({ pageId, title, isPopup, extension: "wix" });

const pageCodeFilePath = ({ pageId, title, isPopup }) =>
  pageFilePath({ pageId, title, isPopup, extension: "js" });

const pageRootFolderPath = ({ pageId, title, isPopup }) => {
  const pageOrLightboxRoot = isPopup ? ROOT_PATHS.LIGHTBOXES : ROOT_PATHS.PAGES;
  const sanitizedTitle = sanitizePageTitle(title);
  return `${pageOrLightboxRoot}/${sanitizedTitle}.${pageId}`;
};

const pageTsConfigFilePath = ({ pageId, title, isPopup }) =>
  `${pageRootFolderPath({ pageId, title, isPopup })}/${TS_CONFIG_NAME}`;

const masterPageTsConfigFilePath = () =>
  `${ROOT_PATHS.SITE_CODE}/${TS_CONFIG_NAME}`;

const backendTsConfigFilePath = () => `${ROOT_PATHS.BACKEND}/${TS_CONFIG_NAME}`;

const publicTsConfigFilePath = () => `${ROOT_PATHS.PUBLIC}/${TS_CONFIG_NAME}`;

module.exports = {
  ROOT_PATHS,

  stylesFilePath,
  sitePartFilePath,
  menuFilePath,
  routerFilePath,
  pageRootFolderPath,
  pageStructureFilePath,
  pageCodeFilePath,
  pageTsConfigFilePath,
  masterPageTsConfigFilePath,
  backendTsConfigFilePath,
  publicTsConfigFilePath,

  isPathRelatedToSite,
  isPathOfCodeFile,
  isPathOfDocumentFile,
  isPathOfWixFile,
  isPathOfPageFile,
  isPathOfPageCode,
  isPathOfPageStructure,
  isPathOfPageTsConfigFile,

  matchLocalPageTsConfigFile,
  matchLocalPageDocumentPath,
  matchLocalPageCodePath
};
