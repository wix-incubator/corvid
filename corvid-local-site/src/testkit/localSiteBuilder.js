const path = require("path");
const flatten_ = require("lodash/flatten");
const set_ = require("lodash/set");
const omit_ = require("lodash/omit");
const sanitize = require("sanitize-filename");

const { siteCreators: sc } = require("corvid-local-test-utils");

const wixFileExtension = "wix";
const pageCodeExtention = "js";
const titleCharReplacement = "_";

const stringify = content => JSON.stringify(content, null, 2);
const removeSpaces = string => string.replace(/\s/g, titleCharReplacement);

const pageFileName = page =>
  [sanitize(removeSpaces(page.title)), page.pageId, wixFileExtension].join(".");

const pageCodeFileName = page =>
  [sanitize(removeSpaces(page.title)), page.pageId, pageCodeExtention].join(
    "."
  );

const lightboxFileName = pageFileName;
const lightboxCodeFileName = pageCodeFileName;

const stylesPath = path.join("frontend", "styles");
const sitePath = path.join("frontend", "site");
const routersPath = path.join("frontend", "routers");
const menusPath = path.join("frontend", "menus");
const pagesPath = path.join("frontend", "pages");
const lightboxesPath = path.join("frontend", "lightboxes");

const wixFilePath = (filename, parentPath = "") =>
  path.join(parentPath, `${filename}.${wixFileExtension}`);

const wixFile = (parentPath, name, content) => ({
  path: wixFilePath(name, parentPath),
  content: stringify(content)
});

const stylesFile = (name, content) => wixFile(stylesPath, name, content);
const colors = content => stylesFile("colors", content);
const fonts = content => stylesFile("fonts", content);
const theme = content => stylesFile("theme", content);
const topLevelStyles = content => stylesFile("topLevelStyles", content);

const siteFile = (name, content) => wixFile(sitePath, name, content);
const commonComponents = content => siteFile("commonComponents", content);
const multilingualInfo = content => siteFile("multilingualInfo", content);
const siteInfo = content => siteFile("siteInfo", content);
const version = content => siteFile("version", content);
const dataFromMasterPage = content => siteFile("dataFromMasterPage", content);

const router = router =>
  wixFile(routersPath, router.prefix, omit_(router, "prefix"));

const menu = menu => wixFile(menusPath, menu.menuId, omit_(menu, "menuId"));

const page = page => ({
  path: path.join(pagesPath, pageFileName(page)),
  content: stringify(page)
});

const pageCode = (page, code) => ({
  path: path.join(pagesPath, pageCodeFileName(page)),
  content: code
});

const pageWithCode = ({ page: pageData, code }) => [
  page(pageData),
  pageCode(pageData, code)
];

const lightbox = lightbox => ({
  path: path.join(lightboxesPath, lightboxFileName(lightbox)),
  content: stringify(lightbox)
});

const lighboxCode = (lightbox, code) => ({
  path: path.join(lightboxesPath, lightboxCodeFileName(lightbox)),
  content: code
});

const lightboxWithCode = ({ lightbox: lightboxData, code }) => [
  lightbox(lightboxData),
  lighboxCode(lightboxData, code)
];

// code

const codeFile = ({ path, content }) => ({ path, content });

const collectionSchema = ({ collectionName, schema }) =>
  codeFile({
    path: `database${path.sep}${collectionName}.json`,
    content: schema
  });

const masterPageCode = ({ content }) =>
  codeFile({
    path: `frontend${path.sep}site.js`,
    content
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
    [sc.dataFromMasterPage]: dataFromMasterPage,
    [sc.publicCode]: codeFile,
    [sc.backendCode]: codeFile,
    [sc.collectionSchema]: collectionSchema,
    [sc.masterPageCode]: masterPageCode
  });

const buildPartial = (...siteItems) => {
  const localFiles = flatten_(siteItems.map(item => itemToFile(item)));

  const localSite = localFiles.reduce(
    (site, file) => set_(site, file.path.split(path.sep), file.content),
    {}
  );

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
