const initSiteManager = require("./src/init");
const {
  isFullWixSite,
  isWixFolder,
  deleteWixSite,
  moveWixSite
} = require("./src/utils");

module.exports = {
  initSiteManager,
  isWixFolder,
  isFullWixSite,
  deleteWixSite,
  moveWixSite
};
