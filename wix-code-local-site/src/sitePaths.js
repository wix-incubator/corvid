const path = require("path");

const publicFolder = "public";

const pages = (fileName = "") =>
  path.join(publicFolder, "pages", fileName ? `${fileName}.json` : "");
const styles = (fileName = "") =>
  path.join(publicFolder, "styles", fileName ? `${fileName}.json` : "");

const site = (fileName = "") =>
  path.join(publicFolder, "site", fileName ? `${fileName}.json` : "");

const lightboxes = (fileName = "") =>
  path.join(publicFolder, "lightboxes", fileName ? `${fileName}.json` : "");
const extraData = () => path.join(publicFolder, `extraData.json`);
const code = filePath => filePath;

module.exports = {
  extraData,
  lightboxes,
  styles,
  pages,
  site,
  code
};
