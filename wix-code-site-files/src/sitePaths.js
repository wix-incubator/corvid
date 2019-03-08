const path = require("path");

const pagesPath = path.join("public", "pages");

const page = pageId => path.join(pagesPath, `${pageId}.json`);

const code = filePath => filePath;

module.exports = {
  page,
  code
};
