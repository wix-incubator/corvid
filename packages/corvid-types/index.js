const prettyStringify = content => JSON.stringify(content, null, 2);
const getTsConfigContent = configName =>
  prettyStringify({
    extends: `corvid-types/configs/tsconfig.${configName}.json`
  });

module.exports = {
  getPageTsConfig: () => getTsConfigContent("pages"),
  getBackendTsConfig: () => getTsConfigContent("backend"),
  getPublicTsConfig: () => getTsConfigContent("public")
};
