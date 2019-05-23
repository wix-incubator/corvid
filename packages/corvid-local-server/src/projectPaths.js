const path = require("path");

const siteSrcPath = siteRootPath => path.join(siteRootPath, "src");
const backupPath = siteRootPath => path.join(siteRootPath, ".corvid", "backup");

module.exports = {
  siteSrcPath,
  backupPath
};
