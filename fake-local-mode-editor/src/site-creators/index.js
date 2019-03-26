const merge_ = require("lodash/merge");
const defaultsDeep_ = require("lodash/defaultsDeep");
const set_ = require("lodash/set");
const omit_ = require("lodash/omit");
const uuid = require("uuid");
const path = require("path");

const {
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
  revisionWithDefaults,
  versionWithDefaults,
  dataFromMasterPageWithDefaults
} = require("./defaults");

/* ************** Styles Creator ************** */

const colors = colors => ({
  siteDocument: {
    styles: {
      colors: colorsWithDefaults(colors)
    }
  }
});

const fonts = fonts => ({
  siteDocument: {
    styles: {
      fonts: fontsWithDefaults(fonts)
    }
  }
});

const theme = theme => ({
  siteDocument: {
    styles: {
      theme: themeWithDefaults(theme)
    }
  }
});

const topLevelStyles = topLevelStyles => ({
  siteDocument: {
    styles: {
      topLevelStyles: topLevelStylesWithDefaults(topLevelStyles)
    }
  }
});

/* ************** Site Creator ************** */

const commonComponents = commonComponents => ({
  siteDocument: {
    site: {
      commonComponents: commonComponentsWithDefaults(commonComponents)
    }
  }
});

const menu = menu => ({
  siteDocument: {
    site: {
      menu: menuWithDefaults(menu)
    }
  }
});

const multilingualInfo = multilingualInfo => ({
  siteDocument: {
    site: {
      multilingualInfo: multilingualInfoWithDefaults(multilingualInfo)
    }
  }
});

const siteInfo = siteInfo => ({
  siteDocument: {
    site: {
      siteInfo: siteInfoWithDefaults(siteInfo)
    }
  }
});

const version = version => ({
  siteDocument: {
    site: {
      version: versionWithDefaults(version)
    }
  }
});

const revision = revision => ({
  siteDocument: {
    site: {
      revision: revisionWithDefaults(revision)
    }
  }
});

const dataFromMasterPage = dataFromMasterPage => ({
  siteDocument: {
    site: {
      dataFromMasterPage: dataFromMasterPageWithDefaults(dataFromMasterPage)
    }
  }
});

/* ************** General Creators ************** */

const page = ({ pageId, title, uriSEO, content } = {}) => {
  const pageData = pageWithDefaults({ pageId, title, uriSEO, content });
  return {
    siteDocument: {
      pages: {
        [pageData.pageId]: pageData
      }
    }
  };
};

const lightbox = ({ pageId, title, uriSEO, content } = {}) => {
  const lightboxData = lightboxWithDefaults({ pageId, title, uriSEO, content });
  return {
    siteDocument: {
      pages: {
        [lightboxData.pageId]: lightboxData
      }
    }
  };
};

const router = ({ prefix, content } = {}) => {
  const routerData = routerWithDefaults({ prefix, content });
  return {
    siteDocument: {
      routers: {
        [routerData.prefix]: omit_(routerData, "prefix")
      }
    }
  };
};

const styles = (...stylesCreators) => ({
  siteDocument: {
    styles: stylesWithDefaults(merge_(...stylesCreators))
  }
});

const site = (...siteCreators) => ({
  siteDocument: {
    site: siteWithDefaults(merge_(siteCreators))
  }
});

const pageCode = (pageId, content = uuid.v4()) =>
  set_({}, ["siteCode", "public", "pages", `${pageId}.js`], content);

const lightboxCode = (pageId, content = uuid.v4()) =>
  set_({}, ["siteCode", "public", "pages", `${pageId}.js`], content);

const publicCode = (relativePath, content = uuid.v4()) =>
  set_(
    {},
    ["siteCode", "public"].concat(relativePath.split(path.sep)),
    content
  );

const backendCode = (relativePath, content = uuid.v4()) =>
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

const createPartial = (...documentCreator) => merge_({}, ...documentCreator);

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
