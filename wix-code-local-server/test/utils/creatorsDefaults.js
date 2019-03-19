const uuid = require("uuid");

const randomize = content => `${uuid.v4()} ${content}`;

/* ************** Defulats ************** */
const getPageDefaults = (pageId = uuid.v4()) => ({
  uriSEO: `${pageId} uri SEO`,
  title: `${pageId} title`,
  isPopUp: false,
  content: `${pageId} encoded file content`
});

const getExtraDataDefaults = (
  content = {
    version: randomize(`extra data version`),
    seoStuff: randomize(`extra data seoStuff`)
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
const getMenuDefaults = (content = randomize(`Encoded menu data`)) => content;
const getMultilingualInfoDefaults = (
  content = randomize(`Encoded multilingualInfo data`)
) => content;
const getSiteInfoDefaults = (
  content = randomize(`Encoded top siteInfo styles data`)
) => content;
const getMetadataDefaults = (
  content = randomize(`Encoded top metadata styles data`)
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
