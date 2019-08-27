const { ROOT_PATHS } = require("./sitePaths");

const getTsConfigContent = configName =>
  `{"extends": "corvid-types/configs/tsconfig.${configName}.json"}`;

const TS_CONFIG_NAME = "tsconfig.json";

const getTypescriptConfigFile = configRoot => {
  const file = {
    path: `${configRoot}/${TS_CONFIG_NAME}`,
    content: ""
  };
  const codeRoots = [ROOT_PATHS.BACKEND, ROOT_PATHS.PUBLIC];

  if (codeRoots.some(root => root === configRoot)) {
    file.content = getTsConfigContent(configRoot);
  } else {
    file.content = getTsConfigContent(ROOT_PATHS.PAGES);
  }
  return file;
};

module.exports = {
  TS_CONFIG_NAME,
  getTypescriptConfigFile
};
