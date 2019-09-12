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
  SITE_CODE: "pages/site"
};

const DEFAULT_FILE_PATHS = {
  METADATA: ".metadata.json",
  SITE_CODE: "pages/site/site.js",
  PACKAGE_JSON: "corvid-package.json"
};

const TS_CONFIG_NAME = "tsconfig.json";
const PAGE_ELEMENTS_TYPE_DECALARATION_FILE_NAME = "pageElements.d.ts";

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

const getMatchLocalPageFileRegex = fileName =>
  `^(?<root>${ROOT_PATHS.PAGES}|${
    ROOT_PATHS.LIGHTBOXES
  })\/(?<folderTitle>[^\/]*)\\.(?<pageId>[^.\/]*)\/${fileName}`;

const matchLocalPageFile = extension => filePath => {
  const matches = filePath.match(
    new RegExp(
      getMatchLocalPageFileRegex(`(?<fileNameTitle>[^\/]*).${extension}`)
    )
  );
  return matches && matches.groups.fileNameTitle === matches.groups.folderTitle
    ? {
        pageId: matches.groups.pageId,
        title: matches.groups.fileNameTitle,
        isPopup: matches.groups.root === ROOT_PATHS.LIGHTBOXES
      }
    : null;
};

const matchLocalPageTsConfigFile = filePath => {
  const matches = filePath.match(
    new RegExp(getMatchLocalPageFileRegex(TS_CONFIG_NAME))
  );
  return matches
    ? {
        pageId: matches.groups.pageId
      }
    : null;
};

const matchLocalPageTypingsFile = filePath => {
  const matches = filePath.match(
    new RegExp(
      getMatchLocalPageFileRegex(PAGE_ELEMENTS_TYPE_DECALARATION_FILE_NAME)
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

const isPathOfPageRealtedFile = (localFilePath, pageId = null) =>
  isPathOfPageCode(localFilePath, pageId) ||
  isPathOfPageStructure(localFilePath, pageId) ||
  isPathOfPageTsConfigFile(localFilePath, pageId) ||
  isPathOfPageTypingsFile(localFilePath, pageId);

const isPathOfWixFile = relativePath => path.extname(relativePath) === ".wix";

const isPathOfPageTypingsFile = (localFilePath, pageId = null) => {
  const match = matchLocalPageTypingsFile(localFilePath);
  return pageId ? match && match.pageId === pageId : !!match;
};
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

const isMetadataFilePath = filePath => filePath === DEFAULT_FILE_PATHS.METADATA;

const isPathOfDocumentFile = relativePath =>
  isPathOfWixFile(relativePath) || isMetadataFilePath(relativePath);

// add tests
const isPathOfCodeFile = relativePath =>
  isPathOfPageCode(relativePath) ||
  isPathOfBackendCodeFile(relativePath) ||
  isPathOfPublicCodeFile(relativePath) ||
  isUnderPath(ROOT_PATHS.DATABASE, relativePath) ||
  relativePath === DEFAULT_FILE_PATHS.SITE_CODE ||
  relativePath === DEFAULT_FILE_PATHS.PACKAGE_JSON;

const stylesFilePath = name => path.join(ROOT_PATHS.STYLES, `${name}.wix`);

const sitePartFilePath = name => path.join(ROOT_PATHS.SITE, `${name}.wix`);

const routerFilePath = prefix => path.join(ROOT_PATHS.ROUTERS, `${prefix}.wix`);

const menuFilePath = menuId => path.join(ROOT_PATHS.MENUS, `${menuId}.wix`);

const removeSpaces = string => string.replace(/\s/g, "_");

const sanitizePageTitle = pageTitle => sanitize(removeSpaces(pageTitle));

const pageFilePath = ({ pageId, title, isPopup, extension, fileName }) => {
  const pageOrLightboxRoot = isPopup ? ROOT_PATHS.LIGHTBOXES : ROOT_PATHS.PAGES;
  const sanitizedFolderTitle = sanitizePageTitle(title);
  const sanitizedFilename = sanitizePageTitle(fileName || title);
  const pageSubFolder = `${pageOrLightboxRoot}/${sanitizedFolderTitle}.${pageId}`;
  const pageFileName = fileName
    ? sanitizedFilename
    : `${sanitizedFilename}.${extension}`;
  return path.join(pageSubFolder, pageFileName);
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

const pageTsConfigFilePath = ({ pageId, title, isPopup }) =>
  pageFilePath({
    pageId,
    title,
    isPopup,
    fileName: TS_CONFIG_NAME
  });

const pageTypingsFilePath = ({ pageId, title, isPopup }) =>
  pageFilePath({
    pageId,
    title,
    isPopup,
    fileName: PAGE_ELEMENTS_TYPE_DECALARATION_FILE_NAME
  });

const masterPageTsConfigFilePath = () =>
  `${ROOT_PATHS.SITE_CODE}/${TS_CONFIG_NAME}`;

const masterPageTypingsFilePath = () =>
  `${ROOT_PATHS.SITE_CODE}/${PAGE_ELEMENTS_TYPE_DECALARATION_FILE_NAME}`;

const backendTsConfigFilePath = () => `${ROOT_PATHS.BACKEND}/${TS_CONFIG_NAME}`;

const publicTsConfigFilePath = () => `${ROOT_PATHS.PUBLIC}/${TS_CONFIG_NAME}`;

module.exports = {
  ROOT_PATHS,
  DEFAULT_FILE_PATHS,
  TYPINGS_NAME: PAGE_ELEMENTS_TYPE_DECALARATION_FILE_NAME,

  stylesFilePath,
  sitePartFilePath,
  menuFilePath,
  routerFilePath,
  pageStructureFilePath,
  pageCodeFilePath,
  pageTsConfigFilePath,
  pageTypingsFilePath,
  masterPageTypingsFilePath,
  masterPageTsConfigFilePath,
  backendTsConfigFilePath,
  publicTsConfigFilePath,

  isPathRelatedToSite,
  isPathOfCodeFile,
  isPathOfDocumentFile,
  isPathOfWixFile,
  isPathOfPageRealtedFile,
  isPathOfPageCode,
  isPathOfPageStructure,
  isPathOfEmptyByDefaultCodeFile,
  isPathOfPageTsConfigFile,
  isPathOfPageTypingsFile,

  matchLocalPageTsConfigFile,
  matchLocalPageTypingsFile,
  matchLocalPageDocumentPath,
  matchLocalPageCodePath
};
