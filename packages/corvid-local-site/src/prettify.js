const logger = require("corvid-local-logger");

const prettyStringify = content => JSON.stringify(content, null, 2);

const tryToPrettifyJsonString = jsonString => {
  try {
    const prettyJsonString = prettyStringify(JSON.parse(jsonString));
    return prettyJsonString;
  } catch (e) {
    logger.info(`failed prettifying json file ${jsonString}`);
    return jsonString;
  }
};

module.exports = {
  tryToPrettifyJsonString,
  prettyStringify
};
