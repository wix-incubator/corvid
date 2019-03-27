const merge_ = require("lodash/merge");
const set_ = require("lodash/set");
const omit_ = require("lodash/omit");

const { siteCreators: sc } = require("@wix/wix-code-local-test-utils");

const colors = colors => ({
  siteDocument: {
    styles: {
      colors
    }
  }
});

const fonts = fonts => ({
  siteDocument: {
    styles: {
      fonts
    }
  }
});

const theme = theme => ({
  siteDocument: {
    styles: {
      theme
    }
  }
});

const topLevelStyles = topLevelStyles => ({
  siteDocument: {
    styles: {
      topLevelStyles
    }
  }
});

const commonComponents = commonComponents => ({
  siteDocument: {
    site: {
      commonComponents
    }
  }
});

const menu = menu => ({
  siteDocument: {
    site: {
      menu
    }
  }
});

const multilingualInfo = multilingualInfo => ({
  siteDocument: {
    site: {
      multilingualInfo
    }
  }
});

const siteInfo = siteInfo => ({
  siteDocument: {
    site: {
      siteInfo
    }
  }
});

const version = version => ({
  siteDocument: {
    site: {
      version
    }
  }
});

const revision = revision => ({
  siteDocument: {
    site: {
      revision
    }
  }
});

const dataFromMasterPage = dataFromMasterPage => ({
  siteDocument: {
    site: {
      dataFromMasterPage
    }
  }
});

const page = page => ({
  siteDocument: {
    pages: {
      [page.pageId]: page
    }
  }
});

const pageCode = (page, code) => ({
  siteCode: {
    public: {
      pages: {
        [`${page.pageId}.js`]: code
      }
    }
  }
});

const pageWithCode = ({ page: pageData, code }) =>
  merge_(page(pageData), pageCode(pageData, code));

const lightbox = lightbox => page(lightbox);

const lighboxCode = (lightbox, code) => pageCode(lightbox, code);

const lightboxWithCode = ({ lightbox: lightboxData, code }) =>
  merge_(lightbox(lightboxData), lighboxCode(lightboxData, code));

const router = router => ({
  siteDocument: {
    routers: {
      [router.prefix]: omit_(router, "prefix")
    }
  }
});

const codeFile = ({ path, content }) =>
  set_({}, `siteCode/${path}`.split("/"), content);

const buildPartial = (...siteItems) =>
  merge_(
    ...siteItems.map(item =>
      sc.matchItem(item, {
        [sc.page]: page,
        [sc.pageWithCode]: pageWithCode,
        [sc.lightbox]: lightbox,
        [sc.lightboxWithCode]: lightboxWithCode,
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
  const defaultSiteItems = sc.fullSiteItems();
  const fullSite = buildPartial(...defaultSiteItems, ...siteItems);
  return fullSite;
};

module.exports = {
  buildFull,
  buildPartial
};
