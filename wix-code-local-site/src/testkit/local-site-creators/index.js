const path = require("path");
const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const mapValues_ = require("lodash/mapValues");
const set_ = require("lodash/set");
const get_ = require("lodash/get");
const omit_ = require("lodash/omit");
const uuid = require("uuid");

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
} = require("@wix/fake-local-mode-editor/src/site-creators/defaults"); // TODO: temporary

const fileExtention = "wix";
const pageCodeExtention = "js";

const stringify = content => JSON.stringify(content, null, 2);
const removeIllegalCharacters = str => str.replace(/[/\\?%*:|"<>\s]/g, "_");

const pageFileName = page =>
  [removeIllegalCharacters(page.title), page.pageId, fileExtention].join(".");

const pageCodeFileName = page =>
  [removeIllegalCharacters(page.title), page.pageId, pageCodeExtention].join(
    "."
  );

const lightboxFileName = pageFileName;

const lightboxCodeFileName = pageCodeFileName;

/* ************** Styles Creator ************** */

const colors = colors => ({
  frontend: {
    styles: {
      [`colors.${fileExtention}`]: stringify(colorsWithDefaults(colors))
    }
  }
});

const fonts = fonts => ({
  frontend: {
    styles: {
      [`fonts.${fileExtention}`]: stringify(fontsWithDefaults(fonts))
    }
  }
});

const theme = theme => ({
  frontend: {
    styles: {
      [`theme.${fileExtention}`]: stringify(themeWithDefaults(theme))
    }
  }
});

const topLevelStyles = topLevelStyles => ({
  frontend: {
    styles: {
      [`topLevelStyles.${fileExtention}`]: stringify(
        topLevelStylesWithDefaults(topLevelStyles)
      )
    }
  }
});

/* ************** Site Creator ************** */

const commonComponents = commonComponents => ({
  frontend: {
    site: {
      [`commonComponents.${fileExtention}`]: stringify(
        commonComponentsWithDefaults(commonComponents)
      )
    }
  }
});

const menu = menu => ({
  frontend: {
    site: {
      [`menu.${fileExtention}`]: stringify(menuWithDefaults(menu))
    }
  }
});

const multilingualInfo = multilingualInfo => ({
  frontend: {
    site: {
      [`multilingualInfo.${fileExtention}`]: stringify(
        multilingualInfoWithDefaults(multilingualInfo)
      )
    }
  }
});

const siteInfo = siteInfo => ({
  frontend: {
    site: {
      [`siteInfo.${fileExtention}`]: stringify(siteInfoWithDefaults(siteInfo))
    }
  }
});

const version = version => ({
  frontend: {
    site: {
      [`version.${fileExtention}`]: stringify(versionWithDefaults(version))
    }
  }
});

const revision = revision => ({
  frontend: {
    site: {
      [`revision.${fileExtention}`]: stringify(revisionWithDefaults(revision))
    }
  }
});

const dataFromMasterPage = dataFromMasterPage => ({
  frontend: {
    site: {
      [`dataFromMasterPage.${fileExtention}`]: stringify(
        dataFromMasterPageWithDefaults(dataFromMasterPage)
      )
    }
  }
});

/* ************** General Creators ************** */

const file = (relativePath, content = uuid.v4()) =>
  set_({}, relativePath.split(path.sep), content);

const publicCode = (relativePath, content = uuid.v4()) =>
  set_({}, ["public"].concat(relativePath.split(path.sep)), content);

const backendCode = (relativePath, content = uuid.v4()) =>
  set_({}, ["backend"].concat(relativePath.split(path.sep)), content);

const router = ({ prefix = uuid.v4(), content }) => {
  const routerData = routerWithDefaults({ prefix, content });
  return {
    frontend: {
      routers: {
        [`${routerData.prefix}.${fileExtention}`]: stringify(
          omit_(routerData, "prefix")
        )
      }
    }
  };
};

const page = ({ pageId, title, uriSEO, content } = {}) => {
  const pageData = pageWithDefaults({ pageId, title, uriSEO, content });
  return {
    frontend: {
      pages: {
        [pageFileName(pageData)]: stringify(pageData)
      }
    }
  };
};

const pageWithCode = (page_ = {}, code = uuid.v4()) => {
  const pageData = pageWithDefaults(page_);
  return merge_(page(pageData), {
    frontend: {
      pages: {
        [pageCodeFileName(pageData)]: code
      }
    }
  });
};

const lightbox = ({ pageId, title, uriSEO, content } = {}) => {
  const lightboxData = lightboxWithDefaults({ pageId, title, uriSEO, content });
  return {
    frontend: {
      lightboxes: {
        [lightboxFileName(lightboxData)]: stringify(lightboxData)
      }
    }
  };
};

const lightboxWithCode = (lightbox_ = {}, code = uuid.v4()) => {
  const lightboxData = lightboxWithDefaults(lightbox_);
  return merge_(lightbox(lightboxData), {
    frontend: {
      lightboxes: {
        [lightboxCodeFileName(lightboxData)]: code
      }
    }
  });
};

const styles = (...stylesCreators) => {
  const styles = stylesWithDefaults(merge_(...stylesCreators));
  return {
    frontend: {
      styles: mapKeys_(
        mapValues_(styles, stringify),
        (_, styleKey) => `${styleKey}.${fileExtention}`
      )
    }
  };
};

const site = (...siteCreators) => {
  const site = siteWithDefaults(merge_(...siteCreators));
  return {
    frontend: {
      site: mapKeys_(
        mapValues_(site, stringify),
        (_, siteKey) => `${siteKey}.${fileExtention}`
      )
    }
  };
};

/* ************** Main LocalSite Creator ************** */

const createFull = (...localSiteCreator) => {
  const initial = {
    frontend: {
      pages: {},
      styles: {},
      site: {},
      routers: {}
    }
  };
  const defaultSite = merge_(styles(), site());
  const partialSite = merge_(...localSiteCreator);

  if (!get_(partialSite, "frontend.pages")) {
    merge_(partialSite, page());
  }

  return merge_(initial, defaultSite, partialSite);
};

const createPartial = (...localSiteCreators) =>
  merge_({}, ...localSiteCreators);

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
