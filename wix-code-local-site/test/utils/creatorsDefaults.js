const uuid = require("uuid");

const randomize = content => `${uuid.v4()} ${content}`;

/* ************** Defulats ************** */
const getPageDefaults = (pageId = uuid.v4()) => ({
  pageId,
  uriSEO: `${pageId} uri SEO`,
  title: `${pageId} title`,
  isPopUp: false,
  content: `${pageId} encoded file content`
});

const getLightboxDefaults = (pageId = uuid.v4()) => ({
  pageId,
  uriSEO: `${pageId} uri SEO`,
  title: `${pageId} title`,
  isPopUp: true,
  content: `${pageId} encoded file content`
});

const getRouterDefaults = (content = randomize(`router data`)) => ({
  content
});

const getStylesDefaults = () => ({
  colors: getColorsDefaults(),
  fonts: getFontsDefaults(),
  theme: getThemeDefaults(),
  topLevelStyles: getTopLevelStylesDefaults()
});

const getSiteDefaults = () => ({
  commonComponents: getCommonComponentsDefaults(),
  menu: getMenuDefaults(),
  multilingualInfo: getMultilingualInfoDefaults(),
  siteInfo: getSiteInfoDefaults(),
  revision: getRevisionDefaults(),
  version: getVersionDefaults(),
  dataFromMasterPage: getDataFromMasterPageDefaults()
});

const getColorsDefaults = (content = randomize(` Encoded colors data`)) =>
  content;
const getFontsDefaults = (content = randomize(`Encoded fonts data`)) => content;
const getThemeDefaults = (content = randomize(`Encoded theme data`)) => content;
const getTopLevelStylesDefaults = (
  content = randomize(`Encoded top level styles data`)
) => content;

const getCommonComponentsDefaults = (
  content = randomize(`Encoded commonComponents data`)
) => content;
const getMenuDefaults = (content = randomize(`Encoded menu site data`)) =>
  content;
const getMultilingualInfoDefaults = (
  content = randomize(`Encoded multilingualInfo site data`)
) => content;
const getSiteInfoDefaults = (
  content = randomize(`Encoded siteInfo site data`)
) => content;
const getRevisionDefaults = (
  content = randomize(`Encoded revision site data`)
) => content;
const getVersionDefaults = (content = randomize(`Encoded version site data`)) =>
  content;
const getDataFromMasterPageDefaults = (
  content = randomize(`Encoded data from master page site data`)
) => content;

module.exports.getPageDefaults = getPageDefaults;
module.exports.getLightboxDefaults = getLightboxDefaults;
module.exports.getRouterDefaults = getRouterDefaults;
module.exports.getStylesDefaults = getStylesDefaults;
module.exports.getSiteDefaults = getSiteDefaults;

module.exports.getColorsDefaults = getColorsDefaults;
module.exports.getFontsDefaults = getFontsDefaults;
module.exports.getThemeDefaults = getThemeDefaults;
module.exports.getTopLevelStylesDefaults = getTopLevelStylesDefaults;

module.exports.getCommonComponentsDefaults = getCommonComponentsDefaults;
module.exports.getMenuDefaults = getMenuDefaults;
module.exports.getMultilingualInfoDefaults = getMultilingualInfoDefaults;
module.exports.getSiteInfoDefaults = getSiteInfoDefaults;
module.exports.getDataFromMasterPageDefaults = getDataFromMasterPageDefaults;
module.exports.getRevisionDefaults = getRevisionDefaults;
module.exports.getVersionDefaults = getVersionDefaults;
