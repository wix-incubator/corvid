const map_ = require("lodash/map");
const logger = require("corvid-local-logger");
const {
  masterPageTypingsFilePath,
  pageTypingsFilePath,
  pageTsConfigFilePath,
  masterPageTsConfigFilePath,
  backendTsConfigFilePath,
  publicTsConfigFilePath
} = require("./sitePaths");

let corvidTypes;
try {
  corvidTypes = require("corvid-types");
} catch (e) {
  logger.info("Using corvid-cli without code completion");
}
const isCorvidTypes = !!corvidTypes;

const pageDocumentToTsConfigFile = page => ({
  path: pageTsConfigFilePath(page),
  content: corvidTypes.getPageTsConfig()
});

module.exports = {
  getPagesTsConfigs: pages => {
    if (!isCorvidTypes) return [];
    return map_(pages, pageDocumentToTsConfigFile);
  },
  getCodeFilesTsConfigs: () => {
    if (!isCorvidTypes) return [];
    return [
      {
        path: masterPageTsConfigFilePath(),
        content: corvidTypes.getPageTsConfig()
      },
      {
        path: backendTsConfigFilePath(),
        content: corvidTypes.getBackendTsConfig()
      },
      {
        path: publicTsConfigFilePath(),
        content: corvidTypes.getPublicTsConfig()
      }
    ];
  },
  getPagesDynamicTypings: (codeIntelligencePayload, pages) => {
    if (!isCorvidTypes) return [];
    const typings = map_(
      codeIntelligencePayload.pages,
      (elementsMap, pageId) => {
        return {
          elementsMap,
          path: pageTypingsFilePath(
            pages.find(page => page.pageId === pageId) || {
              pageId,
              title: "Unknown"
            }
          )
        };
      }
    ).concat([
      {
        elementsMap: codeIntelligencePayload.site.commonComponents,
        path: masterPageTypingsFilePath()
      }
    ]);
    return typings.map(typeObject => ({
      path: typeObject.path,
      content: corvidTypes.getPageDynamicTypingsContent(typeObject.elementsMap)
    }));
  }
};
