const uuid = require("uuid");

/* ************** Defulats ************** */
const getPageDefaults = (pageId = uuid.v4()) => ({
  uriSEO: `${pageId} uri SEO`,
  title: `${pageId} title`,
  isPopUp: false,
  content: `${pageId} encoded file content`
});

const getExtraDataDefaults = (
  content = {
    version: `${uuid.v4()} extra data version`,
    seoStuff: `${uuid.v4()} extra data seoStuff`
  }
) => content;

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
  metadata: getMetadataDefaults()
});

const getColorsDefaults = (content = `${uuid.v4()} Encoded colors data`) =>
  content;
const getFontsDefaults = (content = `${uuid.v4()} Encoded fonts data`) =>
  content;
const getThemeDefaults = (content = `${uuid.v4()} Encoded theme data`) =>
  content;
const getTopLevelStylesDefaults = (
  content = `${uuid.v4()} Encoded top level styles data`
) => content;

const getCommonComponentsDefaults = (
  content = `${uuid.v4()} Encoded commonComponents data`
) => content;
const getMenuDefaults = (content = `${uuid.v4()} Encoded menu data`) => content;
const getMultilingualInfoDefaults = (
  content = `${uuid.v4()} Encoded multilingualInfo data`
) => content;
const getSiteInfoDefaults = (
  content = `${uuid.v4()} Encoded top siteInfo styles data`
) => content;
const getMetadataDefaults = (
  content = `${uuid.v4()} Encoded top metadata styles data`
) => content;

module.exports.getPageDefaults = getPageDefaults;
module.exports.getExtraDataDefaults = getExtraDataDefaults;
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
module.exports.getMetadataDefaults = getMetadataDefaults;
