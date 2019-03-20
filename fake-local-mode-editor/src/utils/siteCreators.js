const merge_ = require("lodash/merge");
const set_ = require("lodash/set");
const uuid = require("uuid");
const path = require("path");

const {
  getPageDefaults,
  getLightboxDefaults,
  getMiscDefaults,
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
  getRevisionDefaults,
  getVersionDefaults,
  getDataFromMasterPageDefaults
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

const version = (content = getVersionDefaults()) => ({
  site: {
    version: content
  }
});

const revision = (content = getRevisionDefaults()) => ({
  site: {
    revision: content
  }
});

const dataFromMasterPage = (content = getDataFromMasterPageDefaults()) => ({
  site: {
    dataFromMasterPage: content
  }
});

/* ************** General Creators ************** */
const page = (pageId = uuid.v4(), options = {}) => ({
  pages: {
    [pageId]: merge_(getPageDefaults(pageId), options)
  }
});

const lightbox = (pageId = uuid.v4(), options = {}) => ({
  pages: {
    [pageId]: merge_(getLightboxDefaults(pageId), options)
  }
});

const misc = (content = getMiscDefaults()) => ({
  misc: content
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

const pageCode = (pageId, content = uuid.v4()) =>
  set_({}, ["public", "pages", `${pageId}.js`], content);

const lightboxCode = (pageId, content = uuid.v4()) =>
  set_({}, ["public", "pages", `${pageId}.js`], content);

const publicCode = (relativePath = "code.js", content = uuid.v4()) =>
  set_({}, ["public"].concat(relativePath.split(path.sep)), content);

const backendCode = (relativePath = "code.js", content = uuid.v4()) =>
  set_({}, ["backend"].concat(relativePath.split(path.sep)), content);

/* ************** Main Document Creator ************** */
const createFull = (...documentCreator) => {
  const initial = {
    pages: {},
    styles: {},
    site: {},
    misc: {}
  };
  const documentDefulats = Object.assign(styles(), site(), misc());
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
  lightboxCode,
  pageCode,
  publicCode,
  backendCode,
  lightbox,
  page,
  styles,
  site,
  misc,
  colors,
  fonts,
  theme,
  topLevelStyles,
  commonComponents,
  menu,
  multilingualInfo,
  siteInfo,
  version,
  revision,
  dataFromMasterPage
};
