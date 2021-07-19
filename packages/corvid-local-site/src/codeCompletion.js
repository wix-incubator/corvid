const map_ = require("lodash/map");
const logger = require("corvid-local-logger");
const { prettyStringify } = require("./utils/prettify");
const {
  masterPageTypingsFilePath,
  pageTypingsFilePath,
  pageTsConfigFilePath,
  masterPageTsConfigFilePath,
  backendTsConfigFilePath,
  publicTsConfigFilePath,
  ROOT_PATHS
} = require("./sitePaths");

let corvidTypes,
  pageTsConfigContent,
  backendTsConfigContent,
  publicTsConfigContent;

try {
  corvidTypes = require("corvid-types");

  const SHARED_COMPILER_OPTIONS = {
    composite: true,
    noEmit: false,
    skipLibCheck: true
  };

  pageTsConfigContent = prettyStringify({
    extends: corvidTypes.configPaths.page,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "public/*": ["../../public/*"],
        "backend/*": ["../../backend/*"]
      },
      ...SHARED_COMPILER_OPTIONS
    }
  });
  backendTsConfigContent = prettyStringify({
    extends: corvidTypes.configPaths.backend,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "backend/*": ["./*"]
      },
      ...SHARED_COMPILER_OPTIONS
    }
  });
  publicTsConfigContent = prettyStringify({
    extends: corvidTypes.configPaths.public,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "public/*": ["./*"]
      },
      ...SHARED_COMPILER_OPTIONS
    }
  });
} catch (e) {
  logger.info("Using corvid-cli without code completion");
}
const isCorvidTypesInstalled = !!corvidTypes;

const getPagesTsConfigs = pages => {
  if (!isCorvidTypesInstalled) return [];
  const pagesConfigsToWrite = map_(pages, page => ({
    path: pageTsConfigFilePath(page),
    content: pageTsConfigContent
  }));

  const rootPagesConfig = {
    path: `${ROOT_PATHS.PAGES}/tsconfig.json`,
    content: prettyStringify({
      files: [],
      references: pagesConfigsToWrite.map(({ path }) => ({
        path: `../${path}`
      }))
    })
  };

  return pagesConfigsToWrite.concat(rootPagesConfig);
};

const getCodeFilesTsConfigs = () => {
  if (!isCorvidTypesInstalled) return [];
  const rootTsConfig = {
    path: `tsconfig.json`,
    content: prettyStringify({
      files: [],
      references: [
        {
          path: ROOT_PATHS.PAGES
        },
        {
          path: ROOT_PATHS.PUBLIC
        },
        {
          path: ROOT_PATHS.BACKEND
        }
      ]
    })
  };
  return [
    rootTsConfig,
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
