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

const isCodeFile = relativePath =>
  !(
    relativePath === extraData() ||
    ["styles", "site"].some(p =>
      relativePath.startsWith(path.join(publicFolder, p))
    ) ||
    ["pages", "lightboxes"].some(
      p =>
        relativePath.startsWith(path.join(publicFolder, p)) &&
        !relativePath.endsWith(".js")
    )
  );

module.exports = {
  isCodeFile,
  extraData,
  lightboxes,
  styles,
  pages,
  site,
  code
};
