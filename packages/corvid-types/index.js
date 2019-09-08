const prettyStringify = content => JSON.stringify(content, null, 2);
const getTsConfigContent = configName =>
  prettyStringify({
    extends: `corvid-types/configs/tsconfig.${configName}.json`
  });

const getPageDynamicTypingsContent = elementsMap =>
  prettyStringify(
    `type PageElementsMap = { ${Object.keys(elementsMap)
      .map(nicknmae => `#${nicknmae}: $${elementsMap[nicknmae]}`)
      .join("; ")} }`
  );

module.exports = {
  getPageTsConfig: () => getTsConfigContent("pages"),
  getBackendTsConfig: () => getTsConfigContent("backend"),
  getPublicTsConfig: () => getTsConfigContent("public"),
  getPageDynamicTypingsContent
};
