const messages = require("./messages_en.json");
const template_ = require("lodash/template");

const getMessage = (key, options) => template_(messages[key])(options);

const ERRORS = {
  OLD_FILE_SYSTEM_LAYOUT_NOT_SUPPORTED: "OLD_FILE_SYSTEM_LAYOUT_NOT_SUPPORTED"
};

module.exports = {
  getMessage,
  ERRORS
};
