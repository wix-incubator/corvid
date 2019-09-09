const logger = require("corvid-local-logger");
const { getMessage } = require("../messages");

const prettyStringify = content => JSON.stringify(content, null, 2);

const tryToPrettifyJsonString = jsonString => {
  try {
    const prettyJsonString = prettyStringify(JSON.parse(jsonString));
    return prettyJsonString;
  } catch (e) {
    logger.warn(getMessage("Prettify_Fail_Log", { jsonString }));
    return jsonString;
  }
};

module.exports = {
  tryToPrettifyJsonString,
  prettyStringify
};
