const { prettyStringify } = require("./utils/prettify");
const getTsConfigContent = configName =>
  prettyStringify(
    `{"extends": "corvid-types/configs/tsconfig.${configName}.json"}`
  );

module.exports = {
  getTsConfigContent
};
