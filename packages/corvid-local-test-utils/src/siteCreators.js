const uniqueId_ = require("lodash/uniqueId");
const defaults_ = require("lodash/defaults");
const mapValues_ = require("lodash/mapValues");
const flow_ = require("lodash/flow");
const mapKeys_ = require("lodash/mapKeys");
const omit_ = require("lodash/omit");
const atob = require("atob");
const btoa = require("btoa");

const sdkTypes = {
  IFRAME: "$w.iframe",
  BUTTON: "$w.button",
  DATASET: "$w.dataset"
};

const generatePageContent = (
  content,
  elementsMap = uniqueElementsMap({
    comp1: randomSdkType(),
    comp2: randomSdkType(),
    comp3: randomSdkType()
  })
) => encodePageContent({ content, elementsMap });

const encodePageContent = content => {
  const encode = flow_([JSON.stringify, encodeURIComponent, unescape, btoa]);
  return encode(content);
};
const decodePageContent = payload => {
  const decode = flow_([atob, escape, decodeURIComponent, JSON.parse]);
  return decode(payload);
};

const unique = prefix => uniqueId_(prefix + "-");
const uniqueCodeFileName = name => unique(name) + ".js";
const uniqueCode = name => `console.log('${unique(name)}');`;
const uniqueJson = str => ({ [str]: unique(str) });
const uniqueCollectionSchema = collectionName => ({
  collectionName,
  fields: {}
});
const uniqueElementsMap = elements =>
  mapKeys_(elements, (sdk, nickname) => unique(nickname));

const randomSdkType = () => {
  const sdkKeys = Object.keys(sdkTypes);
  return sdkTypes[sdkKeys[Math.floor(Math.random() * sdkKeys.length)]];
};

const page = ({ pageId = unique("page"), content, ...rest } = {}) =>
  defaults_({ pageId, isPopup: false }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: content || generatePageContent(`${pageId} encoded page content`)
  });

const pageWithCode = (pageData, code) => {
  const fullPage = page(pageData);
  return {
    page: fullPage,
    code: code || uniqueCode(fullPage.pageId)
  };
};

const lightbox = ({ pageId = unique("lightbox"), content, ...rest } = {}) =>
  defaults_({ pageId, isPopup: true }, rest, {
    title: `${pageId} title`,
    uriSEO: `${pageId} uri SEO`,
    content: content || generatePageContent(`${pageId} encoded page content`)
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

const commonComponents = content => ({
  content:
    content || generatePageContent(unique(`Encoded commonComponents data`))
});

const multilingualInfo = (
  content = unique(`Encoded multilingualInfo site data`)
) => ({ content });

const siteInfo = (content = unique(`Encoded siteInfo site data`)) => ({
  content
});

const version = (content = unique(`Encoded version site data`)) => ({
  content
});

const corvidPackageJson = (content = uniqueJson("corvid-package-json")) => ({
  content
});

const publicCode = (
  relativePath = uniqueCodeFileName("publicCode"),
  content = uniqueCode("public")
) => ({
  path: relativePath,
  content
});

const backendCode = (
  relativePath = uniqueCodeFileName("backendCode"),
  content = uniqueCode("backend")
) => ({
  path: relativePath,
  content
});

const masterPageCode = (content = uniqueCode("masterPageCode")) => ({
  content
});

const collectionSchema = (collectionName = unique("collection"), schema) => {
  return {
    collectionName,
    schema: schema || uniqueCollectionSchema(collectionName)
  };
};

const typeSymbol = Symbol("site-creator-type");

const addType = type => item =>
  Object.assign({}, item, {
    [typeSymbol]: type
  });

const removeType = item => omit_(item, typeSymbol);

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
  return matchingPattern(removeType(item));
};

const isSameCreator = (item1, item2) => getType(item1) === getType(item2);

const codeCreators = mapValues_(
  {
    pageWithCode,
    lightboxWithCode,
    publicCode,
    backendCode,
    collectionSchema,
    corvidPackageJson,
    masterPageCode
  },
  typedCreator
);

const documentCreators = mapValues_(
  {
    page,
    lightbox,
    router,
    colors,
    fonts,
    theme,
    topLevelStyles,
    commonComponents,
    menu,
    multilingualInfo,
    siteInfo,
    version
  },
  typedCreator
);

const creators = { ...documentCreators, ...codeCreators };

const fullSiteItems = () => Object.values(creators).map(creator => creator());

module.exports = {
  atob,
  decodePageContent,
  randomSdkType,
  sdkTypes,
  getType,
  matchItem,
  isSameCreator,
  fullSiteItems,
  documentCreators,
  codeCreators,
  generatePageContent,
  ...creators
};
