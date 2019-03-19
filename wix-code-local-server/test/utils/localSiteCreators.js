const path = require("path");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const mapValues_ = require("lodash/mapValues");
const set_ = require("lodash/set");
const get_ = require("lodash/get");
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

const fileExtention = ".wix";

const stringify = content => JSON.stringify(content, null, 2);

/* ************** Styles Creator ************** */

const colors = (content = getColorsDefaults()) => ({
  public: {
    styles: {
      [`colors${fileExtention}`]: stringify(content)
    }
  }
});

const fonts = (content = getFontsDefaults()) => ({
  public: {
    styles: {
      [`fonts${fileExtention}`]: stringify(content)
    }
  }
});

const theme = (content = getThemeDefaults()) => ({
  public: {
    styles: {
      [`theme${fileExtention}`]: stringify(content)
    }
  }
});

const topLevelStyles = (content = getTopLevelStylesDefaults()) => ({
  public: {
    styles: {
      [`topLevelStyles${fileExtention}`]: stringify(content)
    }
  }
});

/* ************** Site Creator ************** */

const commonComponents = (content = getCommonComponentsDefaults()) => ({
  public: {
    site: {
      [`commonComponents${fileExtention}`]: stringify(content)
    }
  }
});

const menu = (content = getMenuDefaults()) => ({
  public: {
    site: {
      [`menu${fileExtention}`]: stringify(content)
    }
  }
});

const multilingualInfo = (content = getMultilingualInfoDefaults()) => ({
  public: {
    site: {
      [`multilingualInfo${fileExtention}`]: stringify(content)
    }
  }
});

const siteInfo = (content = getSiteInfoDefaults()) => ({
  public: {
    site: {
      [`siteInfo${fileExtention}`]: stringify(content)
    }
  }
});

const metadata = (content = getMetadataDefaults()) => ({
  public: {
    site: {
      [`metadata${fileExtention}`]: stringify(content)
    }
  }
});

/* ************** General Creators ************** */

const code = (relativePath = "backend/code.js", content = uuid.v4()) =>
  set_({}, relativePath.split(path.sep), content);

const page = (pageId = uuid.v4(), options = {}) => {
  const isPopUp = get_(options, "isPopUp");
  return {
    public: {
      [isPopUp ? "lightboxes" : "pages"]: {
        [`${pageId}${fileExtention}`]: stringify(
          merge_(getPageDefaults(pageId), options)
        )
      }
    }
  };
};

const extraData = (options = {}) => ({
  public: {
    [`extraData${fileExtention}`]: stringify(
      merge_(getExtraDataDefaults(), options)
    )
  }
});

const styles = (...stylesCreators) => ({
  public: {
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
  public: {
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
    public: {
      pages: {},
      styles: {},
      site: {},
      [`extraData${fileExtention}`]: stringify("")
    }
  };
  const localSiteDefulats = merge_(styles(), site(), extraData());
  const localSite = localSiteCreator.reduce((document, creator) => {
    return merge_(document, creator);
  }, {});

  if (!get_(localSite, "public.pages")) {
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
  code,
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
