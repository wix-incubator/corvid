/* eslint-disable no-useless-escape */

const map_ = require("lodash/map");
const merge_ = require("lodash/merge");
const find_ = require("lodash/find");
const isEmpty_ = require("lodash/isEmpty");

const logger = require("corvid-local-logger");

const { localFileSystemLayout } = require("./versions");
const { isUnderPath, getFileName } = require("./utils/fileUtils");
const {
  prettyStringify,
  tryToPrettifyJsonString
} = require("./utils/prettify");

const {
  ROOT_PATHS,
  DEFAULT_FILE_PATHS,
  isPathOfWixFile,
  matchLocalPageTsConfigFile,
  matchLocalPageDocumentPath,
  matchLocalPageCodePath,
  isPathOfPageCode,
  isPathOfPageStructure,
  isPathOfPageTsConfigFile,
  stylesFilePath,
  sitePartFilePath,
  menuFilePath,
  routerFilePath,
  pageStructureFilePath,
  pageCodeFilePath,
  pageTsConfigFilePath
} = require("./sitePaths");

const {
  getPagesTsConfigs,
  getCodeFilesTsConfigs
} = require("./codeCompletion");

const { toWixFileContent, fromWixFileContent } = require("./utils/wixFiles");

// document.styles

const styleDocumentToFile = (content, name) => ({
  path: stylesFilePath(name),
  content
});

const styleFileToDocument = styleFile => {
  const styleName = getFileName(styleFile.path);
  return {
    styles: {
      [styleName]: styleFile.content
    }
  };
};

// document.site

const sitePartDocumentToFile = (content, name) => ({
  path: sitePartFilePath(name),
  content
});

const sitePartFileToDocument = sitePartFile => {
  const sitePartName = getFileName(sitePartFile.path);
  return {
    site: {
      [sitePartName]: sitePartFile.content
    }
  };
};

// document.routers

const routerDocumentToFile = (router, prefix) => ({
  path: routerFilePath(prefix),
  content: router
});

const routerFileToDocument = routerFile => {
  const prefix = getFileName(routerFile.path);
  return {
    routers: {
      [prefix]: routerFile.content
    }
  };
};

// document.menus

const menuDocumentToFile = (menu, menuId) => ({
  path: menuFilePath(menuId),
  content: menu
});

const menuFileToDocument = menuFile => {
  const menuId = getFileName(menuFile.path);
  return {
    menus: {
      [menuId]: menuFile.content
    }
  };
};

// pages & lightboxes

const matchEditorPageCodePath = editorCodePath => {
  const matches = editorCodePath.match(/pages\/(?<pageId>[^.\/]*)\.js/);
  return matches ? matches.groups : null;
};

const pageDocumentToFile = page => ({
  path: pageStructureFilePath(page),
  content: page
});

const pageFileToDocument = pageFile => {
  const { pageId, isPopup } = matchLocalPageDocumentPath(pageFile.path);
  return {
    pages: {
      [pageId]: Object.assign({}, pageFile.content, {
        pageId,
        isPopup
      })
    }
  };
};

// misc

const metadataDocumentToFile = documentSchemaVersion => ({
  path: DEFAULT_FILE_PATHS.METADATA,
  content: prettyStringify({
    documentSchemaVersion,
    localFileSystemLayout
  })
});

const metadataFileToDocument = metadataFile => {
  const { documentSchemaVersion } = JSON.parse(metadataFile.content);
  return {
    documentSchemaVersion: documentSchemaVersion
  };
};

// site document

const localFileToDocument = file => {
  const fileConvertor = find_(
    {
      [ROOT_PATHS.PAGES]: pageFileToDocument,
      [ROOT_PATHS.LIGHTBOXES]: pageFileToDocument,
      [ROOT_PATHS.STYLES]: styleFileToDocument,
      [ROOT_PATHS.SITE]: sitePartFileToDocument,
      [ROOT_PATHS.ROUTERS]: routerFileToDocument,
      [ROOT_PATHS.MENUS]: menuFileToDocument,
      [DEFAULT_FILE_PATHS.METADATA]: metadataFileToDocument
    },
    (_, rootPath) => isUnderPath(rootPath, file.path)
  );

  if (!fileConvertor) {
    logger.error(new Error(`Unkown local file path [${file.path}]`));
    return {};
  }
  return fileConvertor(file);
};

const editorDocumentToLocalDocumentFiles = siteDocument => {
  const localDocumentFiles = [
    ...getPagesTsConfigs(siteDocument.pages),
    ...map_(siteDocument.pages, pageDocumentToFile),
    ...map_(siteDocument.styles, styleDocumentToFile),
    ...map_(siteDocument.site, sitePartDocumentToFile),
    ...map_(siteDocument.routers, routerDocumentToFile),
    ...map_(siteDocument.menus, menuDocumentToFile),
    metadataDocumentToFile(siteDocument.documentSchemaVersion)
  ].map(file =>
    isPathOfWixFile(file.path)
      ? Object.assign({}, file, {
          content: toWixFileContent(
            file.content,
            siteDocument.documentSchemaVersion
          )
        })
      : file
  );

  return localDocumentFiles;
};

const localDocumentFilesToEditorDocument = localDocumentFiles => {
  const parsedLocalDocumentFiles = localDocumentFiles.map(file =>
    isPathOfWixFile(file.path)
      ? Object.assign({}, file, {
          content: fromWixFileContent(file.content).content
        })
      : file
  );
  const siteDocument = merge_(
    {
      pages: {},
      styles: {},
      site: {},
      routers: {},
      menus: {}
    },
    ...parsedLocalDocumentFiles.map(localFileToDocument)
  );
  return siteDocument;
};

// site code files

const EDITOR_PATHS = {
  MASTER_PAGE_CODE_FILE: "public/pages/masterPage.js",
  WIX_CODE_PACKAGE_JSON_FILE: "backend/wix-code-package.json"
};

const localPageCodePathToEditorPath = localPageCodePath => {
  const localPageCodeMatches = matchLocalPageCodePath(localPageCodePath);
  if (localPageCodeMatches) {
    const pageId = localPageCodeMatches.pageId;
    return `public/pages/${pageId}.js`;
  }
};

const editorPageCodePathToLocalCodePath = (
  editorCodePath,
  existingLocalPageFilePaths
) => {
  const { pageId } = matchEditorPageCodePath(editorCodePath);

  const existingLocalPageCodeFilePath = existingLocalPageFilePaths.find(
    filePath => isPathOfPageCode(filePath, pageId)
  );
  if (existingLocalPageCodeFilePath) {
    return existingLocalPageCodeFilePath;
  }

  const existingLocalPageStructureFile = existingLocalPageFilePaths.find(
    filePath => isPathOfPageStructure(filePath, pageId)
  );
  if (existingLocalPageStructureFile) {
    return existingLocalPageStructureFile.replace(/\.wix$/, ".js");
  }

  if (!isEmpty_(existingLocalPageFilePaths)) {
    logger.error(
      new Error(`Couldn't match editor page code file path ${editorCodePath}`)
    );
  }

  return pageCodeFilePath({ pageId, title: "Unknown" });
};

const localSchemaPathToEditorPath = localSchemaPath =>
  localSchemaPath.replace(new RegExp(`^${ROOT_PATHS.DATABASE}\/`), ".schemas/");

const editorSchemaPathToLocalPath = editorSchemaPath =>
  editorSchemaPath.replace(".schemas/", `${ROOT_PATHS.DATABASE}/`);

const editorCodePathToLocalCodePath = (
  editorCodePath,
  existingLocalPageFilePaths
) => {
  if (editorCodePath === EDITOR_PATHS.MASTER_PAGE_CODE_FILE) {
    return DEFAULT_FILE_PATHS.SITE_CODE;
  }
  if (editorCodePath === EDITOR_PATHS.WIX_CODE_PACKAGE_JSON_FILE) {
    return DEFAULT_FILE_PATHS.PACKAGE_JSON;
  }
  if (isUnderPath("public/pages", editorCodePath)) {
    return editorPageCodePathToLocalCodePath(
      editorCodePath,
      existingLocalPageFilePaths
    );
  }
  if (
    isUnderPath("backend", editorCodePath) ||
    isUnderPath("public", editorCodePath)
  ) {
    return editorCodePath;
  }
  if (isUnderPath(".schemas", editorCodePath)) {
    return editorSchemaPathToLocalPath(editorCodePath);
  }

  logger.error(new Error(`Unknown editor code file path ${editorCodePath}`));
  return editorCodePath;
};

const localCodePathToEditorCodePath = localCodePath => {
  if (localCodePath === DEFAULT_FILE_PATHS.SITE_CODE) {
    return EDITOR_PATHS.MASTER_PAGE_CODE_FILE;
  }
  if (localCodePath === DEFAULT_FILE_PATHS.PACKAGE_JSON) {
    return EDITOR_PATHS.WIX_CODE_PACKAGE_JSON_FILE;
  }
  if (
    isUnderPath(ROOT_PATHS.PAGES, localCodePath) ||
    isUnderPath(ROOT_PATHS.LIGHTBOXES, localCodePath)
  ) {
    return localPageCodePathToEditorPath(localCodePath);
  }
  if (
    isUnderPath(ROOT_PATHS.BACKEND, localCodePath) ||
    isUnderPath(ROOT_PATHS.PUBLIC, localCodePath)
  ) {
    return localCodePath;
  }
  if (isUnderPath(ROOT_PATHS.DATABASE, localCodePath)) {
    return localSchemaPathToEditorPath(localCodePath);
  }

  logger.error(new Error(`Unknown local code file path ${localCodePath}`));
  return null;
};

const editorCodeFilesToLocalCodeFiles = (
  editorCodeFiles,
  existingLocalPageFilePaths
) =>
  editorCodeFiles
    .map(editorFile => ({
      path: editorCodePathToLocalCodePath(
        editorFile.path,
        existingLocalPageFilePaths
      ),
      content: isUnderPath(".schemas", editorFile.path)
        ? tryToPrettifyJsonString(editorFile.content)
        : editorFile.content
    }))
    .concat(getCodeFilesTsConfigs());

const localCodeFilesToEditorCodeFiles = localCodeFiles => {
  return localCodeFiles
    .map(localFile => ({
      path: localCodePathToEditorCodePath(localFile.path),
      content: localFile.content
    }))
    .filter(file => !!file.path);
};

const updateLocalPageFilePath = (existingPath, newSiteDocumentPages) => {
  if (isPathOfPageCode(existingPath)) {
    const { pageId } = matchLocalPageCodePath(existingPath);
    const newPageInfo = newSiteDocumentPages[pageId];
    return newPageInfo ? pageCodeFilePath(newPageInfo) : null;
  } else if (isPathOfPageStructure(existingPath)) {
    const { pageId } = matchLocalPageDocumentPath(existingPath);
    const newPageInfo = newSiteDocumentPages[pageId];
    return newPageInfo ? pageStructureFilePath(newPageInfo) : null;
  } else if (isPathOfPageTsConfigFile(existingPath)) {
    const { pageId } = matchLocalPageTsConfigFile(existingPath);
    const newPageInfo = newSiteDocumentPages[pageId];
    return newPageInfo ? pageTsConfigFilePath(newPageInfo) : null;
  }
};

module.exports = {
  editorDocumentToLocalDocumentFiles,
  localDocumentFilesToEditorDocument,

  editorCodeFilesToLocalCodeFiles,
  localCodeFilesToEditorCodeFiles,

  editorCodePathToLocalCodePath,
  localCodePathToEditorCodePath,

  updateLocalPageFilePath
};
