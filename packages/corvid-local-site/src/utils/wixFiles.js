const { prettyStringify } = require("./prettify");

const toWixFileContent = (content, documentSchemaVersion) =>
  prettyStringify({
    content,
    documentSchemaVersion
  });

const fromWixFileContent = wixFileContent => JSON.parse(wixFileContent);

module.exports = {
  toWixFileContent,
  fromWixFileContent
};
