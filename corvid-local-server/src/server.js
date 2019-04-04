const {
  moveWixSite,
  deleteWixSite,
  isWixFolder,
  isFullWixSite,
  initSiteManager: initLocalSiteManager
} = require("corvid-local-site");
const logger = require("corvid-local-logger");

const startSocketServer = require("./server/startSocketServer");

const initServerApi = require("./socket-api");

const DEFAULT_EDITOR_PORT = 5000;
const DEFAULT_ADMIN_PORT = 3000;

const isEdit = options => options.type === "EDIT";
const isClone = options => options.type === "CLONE";
const isPullSoft = options => options.type === "SOFT";
const isPullForce = options => options.type === "FORCE";
const isPullMove = options => options.type === "MOVE";

async function startServer(siteRootPath, options = { type: "EDIT" }) {
  logger.info(`server starting at [${siteRootPath}]`);

  const isFullSite = await isFullWixSite(siteRootPath);
  const isWix = await isWixFolder(siteRootPath);

  if (isEdit(options)) {
    if (!isWix) {
      logger.info(
        "Project not found.  Open the Editor in the project's root folder."
      );
      throw new Error("CAN_NOT_EDIT_NON_WIX_SITE");
    }
    if (!isFullSite) {
      logger.info("cannot edit an empty site directory");
      throw new Error("CAN_NOT_EDIT_EMPTY_SITE");
    }
  }

  if (isClone(options)) {
    if (isWix && isFullSite) {
      logger.info("cannot clone into a non empty site directory");
      throw new Error("CAN_NOT_CLONE_NON_EMPTY_SITE");
    }
  }

  if (isPullSoft(options)) {
    if (!isWix) {
      logger.info(
        "Project not found. Pull site files to the project's root folder."
      );
      throw new Error("CAN_NOT_PULL_NON_WIX_SITE");
    }
    if (isFullSite) {
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

  if (isPullMove(options) && !isWix) {
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
}

const startInCloneMode = (siteRootPath, options = { type: "CLONE" }) =>
  startServer(siteRootPath, options);

const startInEditMode = siteRootPath => startServer(siteRootPath);

module.exports = {
  startInCloneMode,
  startInEditMode
};
