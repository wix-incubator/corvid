const messages = require("./messages_en.json");
const template_ = require("lodash/template");

const getMessage = (key, options) => template_(messages[key])(options);

module.exports = getMessage;
