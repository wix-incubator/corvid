const prettyStringify = content => JSON.stringify(content, null, 2);
const getTsConfigContent = configName =>
  prettyStringify({
    extends: `corvid-types/configs/tsconfig.${configName}.json`
  });

const getPageDynamicTypingsContent = elementsMap =>
  "type PageElementsMap = {\n" +
  Object.keys(elementsMap)
    .map(nickname => `  "#${nickname}": ${elementsMap[nickname]};\n`)
    .join("") +
  "}";

module.exports = {
  getPageTsConfig: () => getTsConfigContent("pages"),
  getBackendTsConfig: () => getTsConfigContent("backend"),
  getPublicTsConfig: () => getTsConfigContent("public"),
  getPageDynamicTypingsContent
};
