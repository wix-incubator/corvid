const {
  isSiteEmpty,
  initSiteManager: initLocalSiteManager
} = require("corvid-local-site");
const logger = require("corvid-local-logger");

const startSocketServer = require("./server/startSocketServer");

const initServerApi = require("./socket-api");

const DEFAULT_EDITOR_PORT = 5000;
const DEFAULT_ADMIN_PORT = 3000;

async function startServer(siteRootPath, loadedInCloneMode) {
  logger.info(`server starting at [${siteRootPath}]`);

  const isSitePathEmpty = await isSiteEmpty(siteRootPath);

  if (loadedInCloneMode && !isSitePathEmpty) {
    logger.info("cannot clone into a non empty site directory");
    throw new Error("CAN_NOT_CLONE_NON_EMPTY_SITE");
  }
  if (!loadedInCloneMode && isSitePathEmpty) {
    logger.info("cannot edit an empty site directory");
    throw new Error("CAN_NOT_EDIT_EMPTY_SITE");
  }

  const localSite = await initLocalSiteManager(siteRootPath);
  const editorServer = await startSocketServer(DEFAULT_EDITOR_PORT);
  const adminServer = await startSocketServer(DEFAULT_ADMIN_PORT);

  initServerApi(localSite, adminServer, editorServer, loadedInCloneMode);

  logger.info(
    `server listening at editor port [${editorServer.port}], admin port [${
      adminServer.port
    }]`
  );

  return {
    port: editorServer.port,
    adminPort: adminServer.port,
    close: () => {
      logger.info("server closing");
      localSite.close();
      editorServer.close();
      adminServer.close();
    }
  };
}

const startInCloneMode = siteRootPath => startServer(siteRootPath, true);

const startInEditMode = siteRootPath => startServer(siteRootPath, false);

module.exports = {
  startInCloneMode,
  startInEditMode
};
