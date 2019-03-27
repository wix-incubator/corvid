const uniqueId_ = require("lodash/uniqueId");
const defaults_ = require("lodash/defaults");
const mapValues_ = require("lodash/mapValues");
const flow_ = require("lodash/flow");

const unique = prefix => uniqueId_(prefix + "-");
const uniqueCodeFileName = name => unique(name) + ".js";
const uniqueCode = name => `console.log('${unique(name)}');`;

const page = ({ pageId = unique("page"), ...rest } = {}) =>
  defaults_({ pageId, isPopUp: false }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: `${pageId} encoded page content`
  });

const pageWithCode = (pageData, code) => {
  const fullPage = page(pageData);
  return {
    page: fullPage,
    code: code || uniqueCode(fullPage.pageId)
  };
};

const lightbox = ({ pageId = unique("lightbox"), ...rest } = {}) =>
  defaults_({ pageId, isPopUp: true }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: `${pageId} encoded lightbox content`
  });

const lightboxWithCode = (lightboxData, code) => {
  const fullLightbox = lightbox(lightboxData);
  return {
    lightbox: fullLightbox,
    code: code || uniqueCode(fullLightbox.pageId)
  };
};

const router = ({ prefix = unique("router-prefix"), ...rest } = {}) =>
  defaults_(rest, {
    prefix,
    content: `${prefix} content`
  });

const menu = ({ menuId = unique("menu-id"), ...rest } = {}) =>
  defaults_(rest, {
    menuId,
    content: `${menuId} content`
  });

const colors = (content = unique(`Encoded colors data`)) => ({
  content
});

const fonts = (content = unique(`Encoded fonts data`)) => ({
  content
});

const theme = (content = unique(`Encoded theme data`)) => ({
  content
});

const topLevelStyles = (content = unique(`Encoded top level styles data`)) => ({
  content
});

const commonComponents = (
  content = unique(`Encoded commonComponents data`)
) => ({ content });

const multilingualInfo = (
  content = unique(`Encoded multilingualInfo site data`)
) => ({ content });

const siteInfo = (content = unique(`Encoded siteInfo site data`)) => ({
  content
});

const revision = (content = unique(`Encoded revision site data`)) => ({
  content
});

const version = (content = unique(`Encoded version site data`)) => ({
  content
});

const dataFromMasterPage = (
  content = unique(`Encoded data from master page site data`)
) => ({ content });

const publicCode = (
  relativePath = uniqueCodeFileName("publicCode"),
  content = uniqueCode("public")
) => ({
  path: `public/${relativePath}`,
  content
});

const backendCode = (
  relativePath = uniqueCodeFileName("backendCode"),
  content = uniqueCode("backend")
) => ({
  path: `backend/${relativePath}`,
  content
});

const typeSymbol = Symbol("site-creator-type");

const addType = type => item =>
  Object.assign({}, item, {
    [typeSymbol]: type
  });

const getType = item => item[typeSymbol];

const typedCreator = (creator, type) => {
  const typedCreator = flow_(creator, addType(type));
  typedCreator.toString = () => type;
  return typedCreator;
};

const matchItem = (item, patterns) => {
  const type = getType(item);
  if (!type) {
    throw new Error(`Invalid item ${item}`);
  }
  const matchingPattern = patterns[type] || patterns["*"];
  if (!matchingPattern) {
    throw new Error(`Cannot find mattching pattern for type ${type}`);
  }
  return matchingPattern({ ...item });
};

const creators = mapValues_(
  {
    page,
    pageWithCode,
    lightbox,
    lightboxWithCode,
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
    dataFromMasterPage,
    publicCode,
    backendCode
  },
  typedCreator
);

const fullSiteItems = () => Object.values(creators).map(creator => creator());

module.exports = {
  matchItem,
  fullSiteItems,
  ...creators
};
