const fs = require("fs-extra");
const path = require("path");
const { initSiteManager: initLocalSiteManager } = require("corvid-local-site");
const uuid = require("uuid/v4");
const projectPaths = require("./projectPaths");
const { logger, UserError, logAsyncErrors } = require("corvid-local-logger");

const startSocketServer = require("./server/startSocketServer");

const initServerApi = require("./socket-api");
const adminTokenMiddleware = require("./adminTokenMiddleware");
const getMessage = require("./messages");

const adminToken = uuid();
const DEFAULT_EDITOR_PORT = 5000;
const DEFAULT_ADMIN_PORT = 3000;

const isEdit = options => options.type === "EDIT";
const isClone = options => options.type === "CLONE";
const isPullForce = options => options.type === "FORCE_PULL";
const isPullMove = options => options.type === "MOVE_PULL";

const isEmptyDir = async path => {
  const contents = await fs.readdir(path);
  return contents.length === 0;
};

async function startServer(siteRootPath, options) {
  logger.info(
    getMessage("Server_Start_Log", { path: path.resolve(siteRootPath) })
  );
  const siteSrcPath = projectPaths.siteSrcPath(siteRootPath);
  await fs.ensureDir(siteSrcPath);
  const isEmpty = await isEmptyDir(siteSrcPath);
  const isWix = await fs.exists(
    path.join(siteRootPath, ".corvid", "corvidrc.json")
  ); // TEMPORARY
  const siteBackupPath = projectPaths.backupPath(siteRootPath);
  const hasBackup = await fs.exists(siteBackupPath);

  if (hasBackup) {
    logger.info(getMessage("Server_Backup_Found_Log"));
    throw new UserError("BACKUP_FOLDER_EXISTS");
  }

  if (isEdit(options)) {
    if (!isWix) {
      logger.info(getMessage("Server_Edit_Project_Not_Found_Log"));
      throw new UserError("CAN_NOT_EDIT_NON_WIX_SITE");
    }
    if (isEmpty) {
      logger.info(getMessage("Server_Edit_Empty_Site_Log"));
      throw new UserError("CAN_NOT_EDIT_EMPTY_SITE");
    }
  }

  if (isClone(options)) {
    if (!isWix) {
      logger.info(getMessage("Server_Clone_Project_Not_Found_Log"));
      throw new UserError("CAN_NOT_CLONE_NON_WIX_SITE");
    }
    if (!isEmpty) {
      logger.info(getMessage("Server_Clone_Project_Not_Empty_Site_Log"));
      throw new UserError("CAN_NOT_PULL_NON_EMPTY_SITE");
    }
  }

  if (isPullForce(options)) {
    if (!isWix) {
      logger.info(getMessage("Server_PullForce_Project_Not_Found_Log"));
      throw new UserError("CAN_NOT_PULL_NON_WIX_SITE");
    }
    await fs.emptyDir(siteSrcPath);
  }

  if (isPullMove(options)) {
    if (!isWix) {
      logger.info(getMessage("Server_PullMove_Project_Not_Found_Log"));
      throw new UserError("CAN_NOT_PULL_NON_WIX_SITE");
    }
    const snapshotFolder = path.join(
      siteRootPath,
      ".corvid",
      "snapshots",
      Date.now().toString()
    );

    await fs.move(siteSrcPath, snapshotFolder);
    await fs.emptyDir(siteSrcPath);
  }

  let localSite, editorServer, adminServer;

  const closeAll = () =>
    Promise.all([
      Promise.resolve(localSite && localSite.close()),
      Promise.resolve(editorServer && editorServer.close()),
      Promise.resolve(adminServer && adminServer.close())
    ]);

  try {
    localSite = await initLocalSiteManager(siteSrcPath, siteBackupPath);
    editorServer = await startSocketServer(DEFAULT_EDITOR_PORT, {
      allowedDomains: ["editor.wix.com"].concat(
        process.env.NODE_ENV === "test" ? ["localhost"] : []
      ),
      ensureSession: true
    });
    adminServer = await startSocketServer(DEFAULT_ADMIN_PORT);

    adminServer.io.use(adminTokenMiddleware(adminToken));

    initServerApi(localSite, adminServer, editorServer, !isEdit(options));

    logger.info(
      getMessage("Server_Listening_Log", {
        editorPort: editorServer.port,
        adminPort: adminServer.port
      })
    );
    return {
      port: editorServer.port,
      adminPort: adminServer.port,
      corvidSessionId: process.env.CORVID_SESSION_ID,
      adminToken,
      close: async () => {
        logger.info(getMessage("Server_Close_Log"));
        await closeAll();
      }
    };
  } catch (error) {
    await closeAll();
    throw error;
  }
}

const startInCloneMode = (
  siteRootPath,
  options = { override: false, move: false }
) => {
  if (options.override && options.move) {
    throw new UserError(getMessage("Server_Override_And_Move_Error"));
  }
  let type = "CLONE";
  if (options.move) {
    type = "MOVE_PULL";
  }
  if (options.override) {
    type = "FORCE_PULL";
  }
  return startServer(siteRootPath, {
    type
  });
};
const startInEditMode = siteRootPath =>
  startServer(siteRootPath, {
    type: "EDIT"
  });

module.exports = {
  startInCloneMode: logAsyncErrors(startInCloneMode),
  startInEditMode: logAsyncErrors(startInEditMode)
};
