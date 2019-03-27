const merge_ = require("lodash/merge");
const mapKeys_ = require("lodash/mapKeys");
const mapValues_ = require("lodash/mapValues");
const defaultsDeep_ = require("lodash/defaultsDeep");
const set_ = require("lodash/set");
const get_ = require("lodash/get");
const omit_ = require("lodash/omit");
const sanitize = require("sanitize-filename");

const { siteCreators: sc } = require("@wix/wix-code-local-test-utils");

const fileExtention = "wix";
const pageCodeExtention = "js";
const titleCharReplacement = "_";

const stringify = content => JSON.stringify(content, null, 2);
const removeSpaces = string => string.replace(/\s/g, titleCharReplacement);

const pageFileName = page =>
  [sanitize(removeSpaces(page.title)), page.pageId, fileExtention].join(".");

const pageCodeFileName = page =>
  [sanitize(removeSpaces(page.title)), page.pageId, pageCodeExtention].join(
    "."
  );

const lightboxFileName = pageFileName;

const lightboxCodeFileName = pageCodeFileName;

/* ************** Styles Creator ************** */

const colors = colors => ({
  frontend: {
    styles: {
      [`colors.${fileExtention}`]: stringify(colors)
    }
  }
});

const fonts = fonts => ({
  frontend: {
    styles: {
      [`fonts.${fileExtention}`]: stringify(fonts)
    }
  }
});

const theme = theme => ({
  frontend: {
    styles: {
      [`theme.${fileExtention}`]: stringify(theme)
    }
  }
});

const topLevelStyles = topLevelStyles => ({
  frontend: {
    styles: {
      [`topLevelStyles.${fileExtention}`]: stringify(topLevelStyles)
    }
  }
});

/* ************** Site Creator ************** */

const commonComponents = commonComponents => ({
  frontend: {
    site: {
      [`commonComponents.${fileExtention}`]: stringify(commonComponents)
    }
  }
});

const menu = menu => ({
  frontend: {
    site: {
      [`menu.${fileExtention}`]: stringify(menu)
    }
  }
});

const multilingualInfo = multilingualInfo => ({
  frontend: {
    site: {
      [`multilingualInfo.${fileExtention}`]: stringify(multilingualInfo)
    }
  }
});

const siteInfo = siteInfo => ({
  frontend: {
    site: {
      [`siteInfo.${fileExtention}`]: stringify(siteInfo)
    }
  }
});

const version = version => ({
  frontend: {
    site: {
      [`version.${fileExtention}`]: stringify(version)
    }
  }
});

const revision = revision => ({
  frontend: {
    site: {
      [`revision.${fileExtention}`]: stringify(revision)
    }
  }
});

const dataFromMasterPage = dataFromMasterPage => ({
  frontend: {
    site: {
      [`dataFromMasterPage.${fileExtention}`]: stringify(dataFromMasterPage)
    }
  }
});

const codeFile = ({ path, content }) => set_({}, path.split("/"), content);

const router = router => ({
  frontend: {
    routers: {
      [`${router.prefix}.${fileExtention}`]: stringify(omit_(router, "prefix"))
    }
  }
});

const page = page => ({
  frontend: {
    pages: {
      [pageFileName(page)]: stringify(page)
    }
  }
});

const pageCode = (page, code) => ({
  frontend: {
    pages: {
      [pageCodeFileName(page)]: code
    }
  }
});

const pageWithCode = ({ page: pageData, code }) =>
  merge_(page(pageData), pageCode(pageData, code));

const lightbox = lightbox => ({
  frontend: {
    lightboxes: {
      [lightboxFileName(lightbox)]: stringify(lightbox)
    }
  }
});

const lighboxCode = (lightbox, code) => ({
  frontend: {
    lightboxes: {
      [lightboxCodeFileName(lightbox)]: code
    }
  }
});

const lightboxWithCode = ({ lightbox: lightboxData, code }) =>
  merge_(lightbox(lightboxData, lighboxCode(lightboxData, code)));

const styles = styles => ({
  frontend: {
    styles: mapKeys_(
      mapValues_(styles, stringify),
      (_, styleKey) => `${styleKey}.${fileExtention}`
    )
  }
});

const site = site => ({
  frontend: {
    site: mapKeys_(
      mapValues_(site, stringify),
      (_, siteKey) => `${siteKey}.${fileExtention}`
    )
  }
});

const buildPartial = (...siteItems) =>
  merge_(
    ...siteItems.map(item =>
      sc.matchItem(item, {
        [sc.page]: page,
        [sc.pageWithCode]: pageWithCode,
        [sc.lightbox]: lightbox,
        [sc.lightboxWithCode]: lightboxWithCode,
        [sc.styles]: styles,
        [sc.site]: site,
        [sc.router]: router,
        [sc.colors]: colors,
        [sc.fonts]: fonts,
        [sc.theme]: theme,
        [sc.topLevelStyles]: topLevelStyles,
        [sc.commonComponents]: commonComponents,
        [sc.menu]: menu,
        [sc.multilingualInfo]: multilingualInfo,
        [sc.siteInfo]: siteInfo,
        [sc.version]: version,
        [sc.revision]: revision,
        [sc.dataFromMasterPage]: dataFromMasterPage,
        [sc.publicCode]: codeFile,
        [sc.backendCode]: codeFile
      })
    )
  );

const buildFull = (...siteItems) => {
  const partialSite = buildPartial(...siteItems);

  const defaultSite = merge_(
    {
      frontend: {
        pages: {},
        styles: {},
        site: {},
        routers: {}
      }
    },
    styles(),
    site()
  );

  const fullSite = defaultsDeep_(partialSite, defaultSite);

  if (!get_(fullSite, "frontend.pages")) {
    merge_(fullSite, page());
  }

  return fullSite;
};

module.exports = {
  buildFull,
  buildPartial
};
