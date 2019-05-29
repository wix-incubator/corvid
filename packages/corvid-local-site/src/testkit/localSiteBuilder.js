const flatten_ = require("lodash/flatten");
const set_ = require("lodash/set");
const omit_ = require("lodash/omit");
const sanitize = require("sanitize-filename");

const { siteCreators: sc } = require("corvid-local-test-utils");

const wixFileExtension = "wix";
const pageCodeExtention = "js";
const titleCharReplacement = "_";

const prettyStringify = content => JSON.stringify(content, null, 2);
const removeSpaces = string => string.replace(/\s/g, titleCharReplacement);

const pageFileName = page =>
  [sanitize(removeSpaces(page.title)), page.pageId].join(".");

const pageCodeFileName = page =>
  [sanitize(removeSpaces(page.title)), page.pageId, pageCodeExtention].join(
    "."
  );

const lightboxFileName = pageFileName;
const lightboxCodeFileName = pageCodeFileName;

const PATH_ASSETS = "assets";
const PATH_BACKEND = "backend";
const PATH_PUBLIC = "public";
const PATH_DATABASE = "database";
const PATH_PAGES = "pages";
const PATH_LIGHTBOXES = "lightboxes";

const PATH_STYLES = `${PATH_ASSETS}/styles`;
const PATH_SITE = `${PATH_ASSETS}/site`;
const PATH_ROUTERS = `${PATH_ASSETS}/routers`;
const PATH_MENUS = `${PATH_ASSETS}/menus`;
const documentSchemaVersion = "1.0";

const wrapWithVersion = content => ({
  content,
  documentSchemaVersion
});

const wixFilePath = (filename, parentPath = "") =>
  `${parentPath}/${filename}.${wixFileExtension}`;

const wixFile = (parentPath, name, content) => ({
  path: wixFilePath(name, parentPath),
  content: prettyStringify(wrapWithVersion(content))
});

const stylesFile = (name, content) => wixFile(PATH_STYLES, name, content);
const colors = content => stylesFile("colors", content);
const fonts = content => stylesFile("fonts", content);
const theme = content => stylesFile("theme", content);
const topLevelStyles = content => stylesFile("topLevelStyles", content);

const siteFile = (name, content) => wixFile(PATH_SITE, name, content);
const commonComponents = content => siteFile("commonComponents", content);
const multilingualInfo = content => siteFile("multilingualInfo", content);
const siteInfo = content => siteFile("siteInfo", content);
const version = content => siteFile("version", content);

const router = router =>
  wixFile(PATH_ROUTERS, router.prefix, omit_(router, "prefix"));

const menu = menu => wixFile(PATH_MENUS, menu.menuId, omit_(menu, "menuId"));

const page = page => wixFile(PATH_PAGES, pageFileName(page), page);

const pageCode = (page, code) => ({
  path: `${PATH_PAGES}/${pageCodeFileName(page)}`,
  content: code
});

const pageWithCode = ({ page: pageData, code }) => [
  page(pageData),
  pageCode(pageData, code)
];

const lightbox = lightbox =>
  wixFile(PATH_LIGHTBOXES, lightboxFileName(lightbox), lightbox);

const lighboxCode = (lightbox, code) => ({
  path: `${PATH_LIGHTBOXES}/${lightboxCodeFileName(lightbox)}`,
  content: code
});

const lightboxWithCode = ({ lightbox: lightboxData, code }) => [
  lightbox(lightboxData),
  lighboxCode(lightboxData, code)
];

// code

const codeFile = ({ path, content }) => ({ path, content });

const backendCodeFile = ({ path: relativePath, content }) =>
  codeFile({
    path: `${PATH_BACKEND}/${relativePath}`,
    content
  });

const publicCodeFile = ({ path: relativePath, content }) =>
  codeFile({
    path: `${PATH_PUBLIC}/${relativePath}`,
    content
  });

const collectionSchema = ({ collectionName, schema }) =>
  codeFile({
    path: `${PATH_DATABASE}/${collectionName}.json`,
    content: prettyStringify(schema)
  });

const masterPageCode = ({ content }) =>
  codeFile({
    path: `${PATH_PAGES}/site.js`,
    content
  });

const metadata = () => ({
  path: ".metadata.json",
  content: prettyStringify({
    documentSchemaVersion: "1.0",
    localFileSystemLayout: "1.0"
  })
});

// builders

const itemToFile = item =>
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
    [sc.publicCode]: publicCodeFile,
    [sc.backendCode]: backendCodeFile,
    [sc.collectionSchema]: collectionSchema,
    [sc.masterPageCode]: masterPageCode
  });

const buildPartial = (...siteItems) => {
  const localFiles = flatten_(siteItems.map(item => itemToFile(item)));

  const localSite = localFiles.reduce(
    (site, file) => set_(site, file.path.split("/"), file.content),
    {}
  );
  const file = metadata();
  set_(localSite, file.path.split("/"), file.content);

  return localSite;
};

const buildFull = (...siteItems) => {
  const defaultSiteItems = sc.fullSiteItems();
  const fullSite = buildPartial(...defaultSiteItems, ...siteItems);
  return fullSite;
};

const getLocalFilePath = siteItem => {
  const file = itemToFile(siteItem);
  return sc.matchItem(siteItem, {
    [sc.pageWithCode]: () => ({ page: file[0].path, code: file[1].path }),
    [sc.lightboxWithCode]: () => ({
      lightbox: file[0].path,
      code: file[1].path
    }),
    "*": () => file.path
  });
};

const getLocalFileContent = siteItem => {
  const file = itemToFile(siteItem);
  return sc.matchItem(siteItem, {
    [sc.pageWithCode]: () => ({ page: file[0].content, code: file[1].content }),
    [sc.lightboxWithCode]: () => ({
      lightbox: file[0].content,
      code: file[1].content
    }),
    "*": () => file.content
  });
};

module.exports = {
  buildFull,
  buildPartial,
  getLocalFilePath,
  getLocalFileContent
};
