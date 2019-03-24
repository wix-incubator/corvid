const path = require("path");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const mapValues_ = require("lodash/mapValues");
const set_ = require("lodash/set");
const get_ = require("lodash/get");
const uuid = require("uuid");

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

const fileExtention = ".wix";
const codeExtention = ".js";

const stringify = content => JSON.stringify(content, null, 2);
const removeIllegalCharacters = str => str.replace(/[/\\?%*:|"<>\s]/g, "_");

/* ************** Styles Creator ************** */

const colors = (content = getColorsDefaults()) => ({
  frontend: {
    styles: {
      [`colors${fileExtention}`]: stringify(content)
    }
  }
});

const fonts = (content = getFontsDefaults()) => ({
  frontend: {
    styles: {
      [`fonts${fileExtention}`]: stringify(content)
    }
  }
});

const theme = (content = getThemeDefaults()) => ({
  frontend: {
    styles: {
      [`theme${fileExtention}`]: stringify(content)
    }
  }
});

const topLevelStyles = (content = getTopLevelStylesDefaults()) => ({
  frontend: {
    styles: {
      [`topLevelStyles${fileExtention}`]: stringify(content)
    }
  }
});

/* ************** Site Creator ************** */

const commonComponents = (content = getCommonComponentsDefaults()) => ({
  frontend: {
    site: {
      [`commonComponents${fileExtention}`]: stringify(content)
    }
  }
});

const menu = (content = getMenuDefaults()) => ({
  frontend: {
    site: {
      [`menu${fileExtention}`]: stringify(content)
    }
  }
});

const multilingualInfo = (content = getMultilingualInfoDefaults()) => ({
  frontend: {
    site: {
      [`multilingualInfo${fileExtention}`]: stringify(content)
    }
  }
});

const siteInfo = (content = getSiteInfoDefaults()) => ({
  frontend: {
    site: {
      [`siteInfo${fileExtention}`]: stringify(content)
    }
  }
});

const version = (content = getVersionDefaults()) => ({
  frontend: {
    site: {
      [`version${fileExtention}`]: stringify(content)
    }
  }
});

const revision = (content = getRevisionDefaults()) => ({
  frontend: {
    site: {
      [`revision${fileExtention}`]: stringify(content)
    }
  }
});

const dataFromMasterPage = (content = getDataFromMasterPageDefaults()) => ({
  frontend: {
    site: {
      [`dataFromMasterPage${fileExtention}`]: stringify(content)
    }
  }
});

/* ************** General Creators ************** */

const file = (relativePath = "backend/code.js", content = uuid.v4()) =>
  set_({}, relativePath.split(path.sep), content);

const publicCode = (relativePath = "code.js", content = uuid.v4()) =>
  set_({}, ["public"].concat(relativePath.split(path.sep)), content);

const backendCode = (relativePath = "code.js", content = uuid.v4()) =>
  set_({}, ["backend"].concat(relativePath.split(path.sep)), content);

const page = (pageId = uuid.v4(), options = {}) => {
  const page = merge_(getPageDefaults(pageId), options);
  return {
    frontend: {
      pages: {
        [`${removeIllegalCharacters(
          page.title
        )}.${pageId}${fileExtention}`]: stringify(page)
      }
    }
  };
};

const pageWithCode = (
  pageId = uuid.v4(),
  options = {},
  codeContent = uuid.v4()
) => {
  const pageMergedOptions = merge_(getPageDefaults(pageId), options);
  return merge_(page(pageId, pageMergedOptions), {
    frontend: {
      pages: {
        [`${removeIllegalCharacters(
          pageMergedOptions.title
        )}.${pageId}${codeExtention}`]: codeContent
      }
    }
  });
};

const lightbox = (pageId = uuid.v4(), options = {}) => {
  const lightbox = merge_(getLightboxDefaults(pageId), options);
  return {
    frontend: {
      lightboxes: {
        [`${lightbox.title.replace(
          /[/\\?%*:|"<>\s]/g,
          "_"
        )}.${pageId}${fileExtention}`]: stringify(lightbox)
      }
    }
  };
};

const lightboxWithCode = (
  pageId = uuid.v4(),
  options = {},
  codeContent = uuid.v4()
) => {
  const lightboxMergedOptions = merge_(getLightboxDefaults(pageId), options);
  return merge_(lightbox(pageId, lightboxMergedOptions), {
    frontend: {
      lightboxes: {
        [`${removeIllegalCharacters(
          lightboxMergedOptions.title
        )}.${pageId}${codeExtention}`]: codeContent
      }
    }
  });
};

const misc = (content = getMiscDefaults()) => ({
  frontend: {
    [`misc${fileExtention}`]: stringify(content)
  }
});

const styles = (...stylesCreators) => ({
  frontend: {
    styles: mapKeys_(
      mapValues_(
        merge_(
          getStylesDefaults(),
          stylesCreators.reduce((styles, creator) => {
            return merge_(styles, creator);
          }, {})
        ),
        stringify
      ),
      (styleValue, styleKey) => `${styleKey}${fileExtention}`
    )
  }
});

const site = (...siteCreators) => ({
  frontend: {
    site: mapKeys_(
      mapValues_(
        merge_(
          getSiteDefaults(),
          siteCreators.reduce((site, creator) => {
            return merge_(site, creator);
          }, {})
        ),
        stringify
      ),
      (siteValue, siteKey) => `${siteKey}${fileExtention}`
    )
  }
});

/* ************** Main LocalSite Creator ************** */

const createFull = (...localSiteCreator) => {
  const initial = {
    frontend: {
      pages: {},
      styles: {},
      site: {},
      [`misc${fileExtention}`]: stringify("")
    }
  };
  const localSiteDefulats = merge_(styles(), site(), misc());
  const localSite = localSiteCreator.reduce((document, creator) => {
    return merge_(document, creator);
  }, {});

  if (!get_(localSite, "frontend.pages")) {
    merge_(localSite, page());
  }
  return merge_(initial, localSiteDefulats, localSite);
};

const createPartial = (...localSiteCreator) =>
  localSiteCreator.reduce((document, creator) => {
    return merge_(document, creator);
  }, {});

module.exports = {
  createFull,
  createPartial,
  publicCode,
  backendCode,
  file,
  page,
  pageWithCode,
  lightbox,
  lightboxWithCode,
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
