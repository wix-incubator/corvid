const {
  moveWixSite,
  deleteWixSite,
  isSiteInitialized,
  isEmptySite,
  initSiteManager: initLocalSiteManager
} = require("corvid-local-site");
const logger = require("corvid-local-logger");

const startSocketServer = require("./server/startSocketServer");

const initServerApi = require("./socket-api");

const DEFAULT_EDITOR_PORT = 5000;
const DEFAULT_ADMIN_PORT = 3000;

const isEdit = options => options.type === "EDIT";
const isClone = options => options.type === "CLONE";
const isPullForce = options => options.type === "FORCE_PULL";
const isPullMove = options => options.type === "MOVE_PULL";

async function startServer(siteRootPath, options) {
  logger.info(`server starting at [${siteRootPath}]`);
  const isEmpty = await isEmptySite(siteRootPath);
  const isWix = await isSiteInitialized(siteRootPath);

  if (isEdit(options)) {
    if (!isWix) {
      logger.info(
        "Project not found. Open the Editor in the project's root folder."
      );
      throw new Error("CAN_NOT_EDIT_NON_WIX_SITE");
    }
    if (isEmpty) {
      logger.info("cannot edit an empty site directory");
      throw new Error("CAN_NOT_EDIT_EMPTY_SITE");
    }
  }

  if (isClone(options)) {
    if (!isWix) {
      logger.info(
        "Project not found. Open the Editor in the project's root folder."
      );
      throw new Error("CAN_NOT_CLONE_NON_WIX_SITE");
    }
    if (!isEmpty) {
      logger.info("Project already includes site files.");
      throw new Error("CAN_NOT_PULL_NON_EMPTY_SITE");
    }
  }

  if (isPullForce(options)) {
    if (!isWix) {
      logger.info(
        "Project not found. Pull site files to the project's root folder."
      );
      throw new Error("CAN_NOT_PULL_NON_WIX_SITE");
    }
    await deleteWixSite(siteRootPath);
  }

  if (isPullMove(options)) {
    if (!isWix) {
      logger.info(
        "Project not found. Pull site files to the project's root folder."
      );
      throw new Error("CAN_NOT_PULL_NON_WIX_SITE");
    }
    await moveWixSite(siteRootPath);
  }

  const localSite = await initLocalSiteManager(siteRootPath);
  const editorServer = await startSocketServer(DEFAULT_EDITOR_PORT);
  const adminServer = await startSocketServer(DEFAULT_ADMIN_PORT);

  initServerApi(localSite, adminServer, editorServer, !isEdit(options));

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

const startInCloneMode = (siteRootPath, options = { type: "CLONE" }) =>
  startServer(siteRootPath, options);

const startInEditMode = siteRootPath =>
  startServer(siteRootPath, { type: "EDIT" });

module.exports = {
  startInCloneMode,
  startInEditMode
};
