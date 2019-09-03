const flatten_ = require("lodash/flatten");
const set_ = require("lodash/set");
const omit_ = require("lodash/omit");
const isObject_ = require("lodash/isObject");
const isUndefined_ = require("lodash/isUndefined");
const defaultsDeep_ = require("lodash/defaultsDeep");
const sanitize = require("sanitize-filename");

const { siteCreators: sc } = require("corvid-local-test-utils");

const wixFileExtension = "wix";
const pageCodeExtention = "js";
const titleCharReplacement = "_";

const prettyStringify = content => JSON.stringify(content, null, 2);
const removeSpaces = string => string.replace(/\s/g, titleCharReplacement);

const toFilename = title => sanitize(removeSpaces(title));

const PATH_ASSETS = "assets";
const PATH_BACKEND = "backend";
const PATH_PUBLIC = "public";
const PATH_DATABASE = "database";
const PATH_PAGES = "pages";
const PATH_LIGHTBOXES = "lightboxes";
const PATH_MASTER_PAGE = "site";

const PATH_STYLES = `${PATH_ASSETS}/styles`;
const PATH_SITE = `${PATH_ASSETS}/site`;
const PATH_ROUTERS = `${PATH_ASSETS}/routers`;
const PATH_MENUS = `${PATH_ASSETS}/menus`;
const documentSchemaVersion = "1.0";

const TS_CONFIG_NAME = "tsconfig.json";
const TS_CONFIG_BACKEND_CONTENT = prettyStringify(
  '{"extends": "corvid-types/configs/tsconfig.backend.json"}'
);

const TS_CONFIG_PUBLIC_CONTENT = prettyStringify(
  '{"extends": "corvid-types/configs/tsconfig.public.json"}'
);

const TS_CONFIG_PAGE_CONTENT = prettyStringify(
  '{"extends": "corvid-types/configs/tsconfig.pages.json"}'
);

const LOCAL_SITE_SKELETON = {
  [PATH_ASSETS]: {},
  [PATH_BACKEND]: {
    [TS_CONFIG_NAME]: TS_CONFIG_BACKEND_CONTENT
  },
  [PATH_PUBLIC]: {
    [TS_CONFIG_NAME]: TS_CONFIG_PUBLIC_CONTENT
  },
  [PATH_DATABASE]: {},
  [PATH_PAGES]: {
    [PATH_MASTER_PAGE]: {
      [TS_CONFIG_NAME]: TS_CONFIG_PAGE_CONTENT
    }
  },
  [PATH_LIGHTBOXES]: {}
};

const wrapWithVersion = content => ({
  content,
  documentSchemaVersion
});

const wixFileContent = content => prettyStringify(wrapWithVersion(content));

const wixFile = (parentPath, name, content) => ({
  path: `${parentPath}/${name}.${wixFileExtension}`,
  content: wixFileContent(content)
});

const pageRootPath = page =>
  `${PATH_PAGES}/${toFilename(page.title)}.${page.pageId}`;

const pageFilePath = page =>
  `${pageRootPath(page)}/${toFilename(page.title)}.${wixFileExtension}`;

const pageCodeFilePath = page =>
  `${pageRootPath(page)}/${toFilename(page.title)}.${pageCodeExtention}`;

const lightboxRootPath = lightbox =>
  `${PATH_LIGHTBOXES}/${toFilename(lightbox.title)}.${lightbox.pageId}`;

const lightboxFilePath = lightbox =>
  `${lightboxRootPath(lightbox)}/${toFilename(
    lightbox.title
  )}.${wixFileExtension}`;

const lightboxCodeFilePath = lightbox =>
  `${lightboxRootPath(lightbox)}/${toFilename(
    lightbox.title
  )}.${pageCodeExtention}`;

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

const page = page => [
  { path: pageFilePath(page), content: wixFileContent(page) },
  { path: pageCodeFilePath(page), content: "" },
  {
    path: `${pageRootPath(page)}/${TS_CONFIG_NAME}`,
    content: TS_CONFIG_PAGE_CONTENT
  }
];

const pageCode = (page, code) => ({
  path: pageCodeFilePath(page),
  content: code
});

const pageWithCode = ({ page, code }) => [
  { path: pageFilePath(page), content: wixFileContent(page) },
  pageCode(page, code),
  {
    path: `${pageRootPath(page)}/${TS_CONFIG_NAME}`,
    content: TS_CONFIG_PAGE_CONTENT
  }
];

const lightbox = lightbox => [
  {
    path: lightboxFilePath(lightbox),
    content: wixFileContent(lightbox)
  },
  { path: lightboxCodeFilePath(lightbox), content: "" },
  {
    path: `${lightboxRootPath(lightbox)}/${TS_CONFIG_NAME}`,
    content: TS_CONFIG_PAGE_CONTENT
  }
];

const lighboxCode = (lightbox, code) => ({
  path: lightboxCodeFilePath(lightbox),
  content: code
});

const lightboxWithCode = ({ lightbox, code }) => [
  {
    path: lightboxFilePath(lightbox),
    content: wixFileContent(lightbox)
  },
  lighboxCode(lightbox, code),
  {
    path: `${lightboxRootPath(lightbox)}/${TS_CONFIG_NAME}`,
    content: TS_CONFIG_PAGE_CONTENT
  }
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
    path: `${PATH_PAGES}/site/site.js`,
    content
  });
const corvidPackageJson = ({ content }) =>
  codeFile({
    path: "corvid-package.json",
    content: prettyStringify(content)
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
    [sc.corvidPackageJson]: corvidPackageJson,
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

  return defaultsDeep_(localSite, LOCAL_SITE_SKELETON);
};

const buildFull = (...siteItems) => {
  const defaultSiteItems = sc.fullSiteItems();
  const fullSite = buildPartial(...defaultSiteItems, ...siteItems);
  return fullSite;
};

const getLocalFilePath = (siteItem, partKey) => {
  const file = itemToFile(siteItem);
  const pickValue = paths => (isUndefined_(partKey) ? paths : paths[partKey]);
  return sc.matchItem(siteItem, {
    [sc.page]: () =>
      pickValue({
        page: file[0].path,
        code: file[1].path,
        tsConfig: file[2].path
      }),
    [sc.pageWithCode]: () =>
      pickValue({
        page: file[0].path,
        code: file[1].path,
        tsConfig: file[2].path
      }),
    [sc.lightbox]: () =>
      pickValue({
        page: file[0].path,
        code: file[1].path,
        tsConfig: file[2].path
      }),
    [sc.lightboxWithCode]: () =>
      pickValue({
        page: file[0].path,
        code: file[1].path,
        tsConfig: file[2].path
      }),
    "*": () => file.path
  });
};

const getLocalFileContent = (siteItem, partKey) => {
  const file = itemToFile(siteItem);
  const pickValue = contents =>
    isUndefined_(partKey) ? contents : contents[partKey];
  return sc.matchItem(siteItem, {
    [sc.page]: () =>
      pickValue({
        page: file[0].content,
        code: file[1].content,
        tsConfig: file[2].content
      }),
    [sc.pageWithCode]: () =>
      pickValue({
        page: file[0].content,
        code: file[1].content,
        tsConfig: file[2].content
      }),
    [sc.lightbox]: () =>
      pickValue({
        page: file[0].content,
        code: file[1].content,
        tsConfig: file[2].content
      }),
    [sc.lightboxWithCode]: () =>
      pickValue({
        page: file[0].content,
        code: file[1].content,
        tsConfig: file[2].content
      }),
    "*": () => file.content
  });
};

const getLocalCodeFilePath = siteItem => {
  const localFilePath = getLocalFilePath(siteItem);
  return isObject_(localFilePath) ? localFilePath.code : localFilePath;
};

const getLocalCodeFileContent = siteItem => {
  const localFileContent = getLocalFileContent(siteItem);
  return isObject_(localFileContent) ? localFileContent.code : localFileContent;
};

const getLocalPageRootPath = pageOrLightboxItem =>
  sc.matchItem(pageOrLightboxItem, {
    [sc.page]: pageRootPath,
    [sc.pageWithCode]: ({ page }) => pageRootPath(page),
    [sc.lightbox]: lightboxRootPath,
    [sc.lightboxWithCode]: ({ lightbox }) => lightboxRootPath(lightbox)
  });

module.exports = {
  TS_CONFIG_BACKEND_CONTENT,
  TS_CONFIG_PAGE_CONTENT,
  TS_CONFIG_PUBLIC_CONTENT,

  buildFull,
  buildPartial,
  getLocalFilePath,
  getLocalFileContent,
  getLocalCodeFilePath,
  getLocalCodeFileContent,
  getLocalPageRootPath
};
