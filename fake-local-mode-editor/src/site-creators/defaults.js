const uuid = require("uuid");
const defaults_ = require("lodash/defaults");

const uniqueId = () => uuid.v4();
const randomize = content => `${uniqueId()} ${content}`;

const pageWithDefaults = ({ pageId = uniqueId(), ...rest } = {}) =>
  defaults_({ pageId, isPopUp: false }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: `${pageId} encoded page content`
  });

const lightboxWithDefaults = ({ pageId = uniqueId(), ...rest } = {}) =>
  defaults_({ pageId, isPopUp: true }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: `${pageId} encoded lightbox content`
  });

const routerWithDefaults = ({ prefix, ...rest } = {}) =>
  defaults_(rest, {
    prefix,
    content: `${prefix} content`
  });

const stylesWithDefaults = (styles = {}) =>
  defaults_(styles, {
    colors: colorsWithDefaults(),
    fonts: fontsWithDefaults(),
    theme: themeWithDefaults(),
    topLevelStyles: topLevelStylesWithDefaults()
  });

const siteWithDefaults = (site = {}) =>
  defaults_(site, {
    commonComponents: commonComponentsWithDefaults(),
    menu: menuWithDefaults(),
    multilingualInfo: multilingualInfoWithDefaults(),
    siteInfo: siteInfoWithDefaults(),
    revision: revisionWithDefaults(),
    version: versionWithDefaults(),
    dataFromMasterPage: dataFromMasterPageWithDefaults()
  });

const colorsWithDefaults = (colors = randomize(` Encoded colors data`)) =>
  colors;

const fontsWithDefaults = (fonts = randomize(`Encoded fonts data`)) => fonts;

const themeWithDefaults = (theme = randomize(`Encoded theme data`)) => theme;

const topLevelStylesWithDefaults = (
  topLevelStyles = randomize(`Encoded top level styles data`)
) => topLevelStyles;

const commonComponentsWithDefaults = (
  commonComponents = randomize(`Encoded commonComponents data`)
) => commonComponents;

const menuWithDefaults = (menu = randomize(`Encoded menu site data`)) => menu;

const multilingualInfoWithDefaults = (
  multilingualInfo = randomize(`Encoded multilingualInfo site data`)
) => multilingualInfo;

const siteInfoWithDefaults = (
  siteInfo = randomize(`Encoded siteInfo site data`)
) => siteInfo;

const revisionWithDefaults = (
  revision = randomize(`Encoded revision site data`)
) => revision;

const versionWithDefaults = (
  version = randomize(`Encoded version site data`)
) => version;

const dataFromMasterPageWithDefaults = (
  dataFromMasterPage = randomize(`Encoded data from master page site data`)
) => dataFromMasterPage;

module.exports = {
  pageWithDefaults,
  lightboxWithDefaults,
  routerWithDefaults,
  stylesWithDefaults,
  siteWithDefaults,
  colorsWithDefaults,
  fontsWithDefaults,
  themeWithDefaults,
  topLevelStylesWithDefaults,
  commonComponentsWithDefaults,
  menuWithDefaults,
  multilingualInfoWithDefaults,
  siteInfoWithDefaults,
  dataFromMasterPageWithDefaults,
  revisionWithDefaults,
  versionWithDefaults
};
