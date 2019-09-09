const map_ = require("lodash/map");
const logger = require("corvid-local-logger");
const {
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
  }
};
