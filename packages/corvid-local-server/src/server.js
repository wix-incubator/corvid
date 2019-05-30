/* eslint-disable no-console */

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
  console.log("starting server");
  logger.info(
    getMessage("Server_Start_Log", { path: path.resolve(siteRootPath) })
  );
  const siteSrcPath = projectPaths.siteSrcPath(siteRootPath);
  await fs.ensureDir(siteSrcPath);
  const isEmpty = await isEmptyDir(siteSrcPath);
  const isWix = await fs.exists(
    path.join(siteRootPath, ".corvid", "corvidrc.json")
  ); // TEMPORARY
  const hasBackup = await fs.exists(projectPaths.backupPath(siteRootPath));

  if (hasBackup) {
    logger.info(getMessage("Server_Backup_Found_Log"));
    throw new Error("BACKUP_FOLDER_EXISTS");
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

  const localSite = await initLocalSiteManager(siteSrcPath);
  console.log("after init localSiteManager");
  console.log("before start editor server");
  const editorServer = await startSocketServer(DEFAULT_EDITOR_PORT, {
    allowedDomains: ["editor.wix.com"].concat(
      process.env.NODE_ENV === "test" ? ["localhost"] : []
    )
  });
  console.log("after start editor server");
  console.log("before start admin server");
  const adminServer = await startSocketServer(DEFAULT_ADMIN_PORT);
  console.log("after start admin server");

  adminServer.io.use(adminTokenMiddleware(adminToken));

  initServerApi(
    localSite,
    adminServer,
    editorServer,
    !isEdit(options),
    siteRootPath
  );

  logger.info(
    getMessage("Server_Listening_Log", {
      editorPort: editorServer.port,
      adminPort: adminServer.port
    })
  );
  return {
    port: editorServer.port,
    adminPort: adminServer.port,
    adminToken,
    close: () => {
      logger.info(getMessage("Server_Close_Log"));
      localSite.close();
      editorServer.close();
      adminServer.close();
    }
  };
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
