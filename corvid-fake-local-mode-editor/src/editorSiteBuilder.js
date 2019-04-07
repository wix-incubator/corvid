const merge_ = require("lodash/merge");
const set_ = require("lodash/set");
const omit_ = require("lodash/omit");

const { siteCreators: sc } = require("corvid-local-test-utils");

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

const menu = menu => ({
  siteDocument: {
    menus: {
      [menu.menuId]: omit_(menu, "menuId")
    }
  }
});

const codeFile = ({ path, content }) =>
  set_({}, `siteCode/${path}`.split("/"), content);

const publicCodeFile = ({ path, content }) =>
  codeFile({
    path: `public/${path}`,
    content
  });

const backendCodeFile = ({ path, content }) =>
  codeFile({
    path: `backend/${path}`,
    content
  });

const collectionSchema = ({ collectionName, schema }) =>
  codeFile({
    path: `.schemas/${collectionName}.json`,
    content: schema
  });

const masterPageCode = ({ content }) =>
  codeFile({
    path: `public/pages/masterPage.js`,
    content
  });

const buildPartial = (...siteItems) =>
  merge_(
    ...siteItems.map(item =>
      sc.matchItem(item, {
        [sc.page]: page,
        [sc.pageWithCode]: pageWithCode,
        [sc.lightbox]: lightbox,
        [sc.lightboxWithCode]: lightboxWithCode,
        [sc.router]: router,
        [sc.menu]: menu,
        [sc.colors]: colors,
        [sc.fonts]: fonts,
        [sc.theme]: theme,
        [sc.topLevelStyles]: topLevelStyles,
        [sc.commonComponents]: commonComponents,
        [sc.multilingualInfo]: multilingualInfo,
        [sc.siteInfo]: siteInfo,
        [sc.version]: version,
        [sc.dataFromMasterPage]: dataFromMasterPage,
        [sc.publicCode]: publicCodeFile,
        [sc.backendCode]: backendCodeFile,
        [sc.collectionSchema]: collectionSchema,
        [sc.masterPageCode]: masterPageCode,
        [sc.corvidrc]: () => ({})
      })
    )
  );

const buildFull = (...siteItems) => {
  const defaultSiteItems = sc.fullSiteItems();
  const fullSite = buildPartial(...defaultSiteItems, ...siteItems);
  return fullSite;
};

const getEditorCodeFilePath = item =>
  sc.matchItem(item, {
    [sc.pageWithCode]: ({ page }) => `public/pages/${page.pageId}.js`,
    [sc.lightboxWithCode]: ({ lightbox }) =>
      `public/pages/${lightbox.pageId}.js`,
    [sc.publicCode]: ({ path }) => `public/${path}`,
    [sc.masterPageCode]: () => `public/pages/masterPage.js`,
    [sc.backendCode]: ({ path }) => `backend/${path}`,
    [sc.collectionSchema]: ({ collectionName }) =>
      `.schemas/${collectionName}.json`
  });

module.exports = {
  buildFull,
  buildPartial,
  getEditorCodeFilePath
};
