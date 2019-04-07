const initSiteManager = require("./src/init");
const {
  isEmptySite,
  isSiteInitialized,
  deleteWixSite,
  moveWixSite
} = require("./src/utils");

module.exports = {
  initSiteManager,
  isSiteInitialized,
  isEmptySite,
  deleteWixSite,
  moveWixSite
};
