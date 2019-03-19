const merge_ = require("lodash/merge");
const uuid = require("uuid");

const {
  getPageDefaults,
  getExtraDataDefaults,
  getStylesDefaults,
  getSiteDefaults,
  getColorsDefaults,
  getFontsDefaults,
  getThemeDefaults,
  getTopLevelStylesDefaults,
  getCommonComponentsDefaults,
  getMenuDefaults,
  getMultilingualInfoDefaults,
  getSiteInfoDefaults,
  getMetadataDefaults
} = require("./creatorsDefaults");

/* ************** Styles Creator ************** */

const colors = (content = getColorsDefaults()) => ({
  styles: {
    colors: content
  }
});

const fonts = (content = getFontsDefaults()) => ({
  styles: {
    fonts: content
  }
});

const theme = (content = getThemeDefaults()) => ({
  styles: {
    theme: content
  }
});

const topLevelStyles = (content = getTopLevelStylesDefaults()) => ({
  styles: {
    topLevelStyles: content
  }
});

/* ************** Site Creator ************** */

const commonComponents = (content = getCommonComponentsDefaults()) => ({
  site: {
    commonComponents: content
  }
});

const menu = (content = getMenuDefaults()) => ({
  site: {
    menu: content
  }
});

const multilingualInfo = (content = getMultilingualInfoDefaults()) => ({
  site: {
    multilingualInfo: content
  }
});

const siteInfo = (content = getSiteInfoDefaults()) => ({
  site: {
    siteInfo: content
  }
});

const metadata = (content = getMetadataDefaults()) => ({
  site: {
    metadata: content
  }
});

/* ************** General Creators ************** */
const page = (pageId = uuid.v4(), options = {}) => ({
  pages: {
    [pageId]: merge_(getPageDefaults(pageId), options)
  }
});

const extraData = (options = {}) => ({
  ["extraData"]: merge_(getExtraDataDefaults(), options)
});

const styles = (...stylesCreators) => ({
  styles: merge_(
    getStylesDefaults(),
    stylesCreators.reduce((styles, creator) => {
      return merge_(styles, creator);
    }, {})
  )
});

const site = (...siteCreators) => ({
  site: merge_(
    getSiteDefaults(),
    siteCreators.reduce((site, creator) => {
      return merge_(site, creator);
    }, {})
  )
});

/* ************** Main Document Creator ************** */
const createFull = (...documentCreator) => {
  const initial = {
    pages: {},
    styles: {},
    site: {},
    extraData: {}
  };
  const documentDefulats = Object.assign(styles(), site(), extraData());
  const documentSite = documentCreator.reduce((document, creator) => {
    return merge_(document, creator);
  }, {});

  if (!documentSite.hasOwnProperty("pages")) {
    merge_(documentSite, page());
  }
  return merge_(initial, documentDefulats, documentSite);
};

const createPartial = (...documentCreator) =>
  documentCreator.reduce((document, creator) => {
    return merge_(document, creator);
  }, {});

module.exports = {
  createFull,
  createPartial,
  page,
  styles,
  site,
  extraData,
  colors,
  fonts,
  theme,
  topLevelStyles,
  commonComponents,
  menu,
  multilingualInfo,
  siteInfo,
  metadata
};
