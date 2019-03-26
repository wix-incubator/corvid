const merge_ = require("lodash/merge");
const defaultsDeep_ = require("lodash/defaultsDeep");
const set_ = require("lodash/set");
const uuid = require("uuid");
const path = require("path");

const {
  getPageDefaults,
  getLightboxDefaults,
  getRouterDefaults,
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
} = require("./defaults");

/* ************** Styles Creator ************** */

const colors = (content = getColorsDefaults()) => ({
  siteDocument: {
    styles: {
      colors: content
    }
  }
});

const fonts = (content = getFontsDefaults()) => ({
  siteDocument: {
    styles: {
      fonts: content
    }
  }
});

const theme = (content = getThemeDefaults()) => ({
  siteDocument: {
    styles: {
      theme: content
    }
  }
});

const topLevelStyles = (content = getTopLevelStylesDefaults()) => ({
  siteDocument: {
    styles: {
      topLevelStyles: content
    }
  }
});

/* ************** Site Creator ************** */

const commonComponents = (content = getCommonComponentsDefaults()) => ({
  siteDocument: {
    site: {
      commonComponents: content
    }
  }
});

const menu = (content = getMenuDefaults()) => ({
  siteDocument: {
    site: {
      menu: content
    }
  }
});

const multilingualInfo = (content = getMultilingualInfoDefaults()) => ({
  siteDocument: {
    site: {
      multilingualInfo: content
    }
  }
});

const siteInfo = (content = getSiteInfoDefaults()) => ({
  siteDocument: {
    site: {
      siteInfo: content
    }
  }
});

const version = (content = getVersionDefaults()) => ({
  siteDocument: {
    site: {
      version: content
    }
  }
});

const revision = (content = getRevisionDefaults()) => ({
  siteDocument: {
    site: {
      revision: content
    }
  }
});

const dataFromMasterPage = (content = getDataFromMasterPageDefaults()) => ({
  siteDocument: {
    site: {
      dataFromMasterPage: content
    }
  }
});

/* ************** General Creators ************** */
const page = (pageId = uuid.v4(), options = {}) => ({
  siteDocument: {
    pages: {
      [pageId]: merge_(getPageDefaults(pageId), options)
    }
  }
});

const lightbox = (pageId = uuid.v4(), options = {}) => ({
  siteDocument: {
    pages: {
      [pageId]: merge_(getLightboxDefaults(pageId), options)
    }
  }
});

const router = (prefix = uuid.v4(), options = {}) => ({
  siteDocument: {
    routers: {
      [prefix]: merge_(getRouterDefaults(`${prefix} content`), options)
    }
  }
});

const styles = (...stylesCreators) => ({
  siteDocument: {
    styles: merge_(
      getStylesDefaults(),
      stylesCreators.reduce((styles, creator) => {
        return merge_(styles, creator);
      }, {})
    )
  }
});

const site = (...siteCreators) => ({
  siteDocument: {
    site: merge_(
      getSiteDefaults(),
      siteCreators.reduce((site, creator) => {
        return merge_(site, creator);
      }, {})
    )
  }
});

const pageCode = (pageId, content = uuid.v4()) =>
  set_({}, ["siteCode", "public", "pages", `${pageId}.js`], content);

const lightboxCode = (pageId, content = uuid.v4()) =>
  set_({}, ["siteCode", "public", "pages", `${pageId}.js`], content);

const publicCode = (relativePath = "code.js", content = uuid.v4()) =>
  set_(
    {},
    ["siteCode", "public"].concat(relativePath.split(path.sep)),
    content
  );

const backendCode = (relativePath = "code.js", content = uuid.v4()) =>
  set_(
    {},
    ["siteCode", "backend"].concat(relativePath.split(path.sep)),
    content
  );

/* ************** Main Document Creator ************** */
const createFull = (...documentCreator) => {
  const defaultSite = merge_(
    {
      siteDocument: {
        pages: {},
        styles: {},
        site: {},
        routers: {}
      },
      siteCode: {}
    },
    styles(),
    site()
  );

  const partialSite = createPartial(...documentCreator);
  const fullSite = defaultsDeep_(partialSite, defaultSite);

  if (!fullSite.siteDocument.hasOwnProperty("pages")) {
    merge_(fullSite, page());
  }

  return fullSite;
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
  router,
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
