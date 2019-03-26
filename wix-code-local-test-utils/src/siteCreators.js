const uuid = require("uuid");
const defaults_ = require("lodash/defaults");
const mapValues_ = require("lodash/mapValues");
const flow_ = require("lodash/flow");

const uniqueId = () => uuid.v4();
const uniqueFilePath = () => uniqueId() + ".js";
const randomize = content => `${uniqueId()} ${content}`;

const page = ({ pageId = uniqueId(), ...rest } = {}) =>
  defaults_({ pageId, isPopUp: false }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: `${pageId} encoded page content`
  });

const pageWithCode = (pageData, code = uuid.v4()) => ({
  page: page(pageData),
  code
});

const lightbox = ({ pageId = uniqueId(), ...rest } = {}) =>
  defaults_({ pageId, isPopUp: true }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: `${pageId} encoded lightbox content`
  });

const lightboxWithCode = (lightboxData, code = uuid.v4()) => ({
  lightbox: lightbox(lightboxData),
  code
});

const router = ({ prefix = uniqueId(), ...rest } = {}) =>
  defaults_(rest, {
    prefix,
    content: `${prefix} content`
  });

const styles = (styles = {}) =>
  defaults_(styles, {
    colors: colors(),
    fonts: fonts(),
    theme: theme(),
    topLevelStyles: topLevelStyles()
  });

const site = (site = {}) =>
  defaults_(site, {
    commonComponents: commonComponents(),
    menu: menu(),
    multilingualInfo: multilingualInfo(),
    siteInfo: siteInfo(),
    revision: revision(),
    version: version(),
    dataFromMasterPage: dataFromMasterPage()
  });

const colors = (content = randomize(` Encoded colors data`)) => ({
  content
});

const fonts = (content = randomize(`Encoded fonts data`)) => ({
  content
});

const theme = (content = randomize(`Encoded theme data`)) => ({
  content
});

const topLevelStyles = (
  content = randomize(`Encoded top level styles data`)
) => ({ content });

const commonComponents = (
  content = randomize(`Encoded commonComponents data`)
) => ({ content });

const menu = (content = randomize(`Encoded menu site data`)) => ({
  content
});

const multilingualInfo = (
  content = randomize(`Encoded multilingualInfo site data`)
) => ({ content });

const siteInfo = (content = randomize(`Encoded siteInfo site data`)) => ({
  content
});

const revision = (content = randomize(`Encoded revision site data`)) => ({
  content
});

const version = (content = randomize(`Encoded version site data`)) => ({
  content
});

const dataFromMasterPage = (
  content = randomize(`Encoded data from master page site data`)
) => ({ content });

const publicCode = (relativePath = uniqueFilePath(), content = uuid.v4()) => ({
  path: `public/${relativePath}`,
  content
});

const backendCode = (relativePath = uniqueFilePath(), content = uuid.v4()) => ({
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
  const matchingPattern = patterns[type];
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
    dataFromMasterPage,
    publicCode,
    backendCode
  },
  typedCreator
);

module.exports = {
  matchItem,
  ...creators
};
