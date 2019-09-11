const map_ = require("lodash/map");
const logger = require("corvid-local-logger");
const { prettyStringify } = require("./utils/prettify");
const {
  masterPageTypingsFilePath,
  pageTypingsFilePath,
  pageTsConfigFilePath,
  masterPageTsConfigFilePath,
  backendTsConfigFilePath,
  publicTsConfigFilePath
} = require("./sitePaths");

let corvidTypes,
  pageTsConfigContent,
  backendTsConfigContent,
  publicTsConfigContent;

try {
  corvidTypes = require("corvid-types");

  pageTsConfigContent = prettyStringify({
    extends: corvidTypes.configPaths.page,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "public/*": ["../../public/*"]
      }
    }
  });
  backendTsConfigContent = prettyStringify({
    extends: corvidTypes.configPaths.backend,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "backend/*": ["./*"]
      }
    }
  });
  publicTsConfigContent = prettyStringify({
    extends: corvidTypes.configPaths.public,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "public/*": ["./*"]
      }
    }
  });
} catch (e) {
  logger.info("Using corvid-cli without code completion");
}
const isCorvidTypesInstalled = !!corvidTypes;

const getPagesTsConfigs = pages => {
  if (!isCorvidTypesInstalled) return [];
  return map_(pages, page => ({
    path: pageTsConfigFilePath(page),
    content: pageTsConfigContent
  }));
};

const getCodeFilesTsConfigs = () => {
  if (!isCorvidTypesInstalled) return [];
  return [
    {
      path: masterPageTsConfigFilePath(),
      content: pageTsConfigContent
    },
    {
      path: backendTsConfigFilePath(),
      content: backendTsConfigContent
    },
    {
      path: publicTsConfigFilePath(),
      content: publicTsConfigContent
    }
  ];
};

const getPagesDynamicTypings = (codeIntelligencePayload, pages) => {
  if (!isCorvidTypesInstalled) return [];
  const typings = map_(codeIntelligencePayload.pages, (elementsMap, pageId) => {
    return {
      elementsMap,
      path: pageTypingsFilePath(
        pages.find(page => page.pageId === pageId) || {
          pageId,
          title: "Unknown"
        }
      )
    };
  }).concat([
    {
      elementsMap: codeIntelligencePayload.site.commonComponents,
      path: masterPageTypingsFilePath()
    }
  ]);
  return typings.map(typeObject => ({
    path: typeObject.path,
    content: corvidTypes.getPageElementsTypeDeclarations(typeObject.elementsMap)
  }));
};

module.exports = {
  getPagesTsConfigs,
  getCodeFilesTsConfigs,
  getPagesDynamicTypings
};
