const { version: moduleVersion } = require("../../package.json");
const logger = require("corvid-local-logger");
const editorSocketApi = require("./editorSocketHandler");
const adminSocketApi = require("./adminSocketHandler");
const backup = require("../backup");

const initServerApi = (
  localSite,
  adminServer,
  editorServer,
  loadedInCloneMode,
  siteRootPath
) => {
  const notifyAdmin = (event, payload) =>
    adminServer.io.sockets.emit(event, payload);

  let wasSiteDocumentUpdated = false;
  let wereCodeFilesUpdated = false;

  const getServerVersion = () => moduleVersion;

  const wasSiteSaved = () => wasSiteDocumentUpdated && wereCodeFilesUpdated;

  const isCloneMode = () => loadedInCloneMode && !wasSiteSaved();

  const withCloneModeNotification = asyncCallback => async (...args) => {
    const cloneModeBefore = isCloneMode();
    const result = await asyncCallback(...args);
    const cloneModeAfter = isCloneMode();
    if (cloneModeBefore && !cloneModeAfter) {
      logger.verbose("clone complete");
      notifyAdmin("clone-complete");
    }
    return result;
  };

  const withBackup = backup.withBackupInit(siteRootPath, localSite);

  const getEditorPort = () => editorServer.port;

  const isEditorConnected = () =>
    Object.keys(editorServer.io.sockets.connected).length > 0;

  const getSiteDocument = () => {
    logger.verbose("site document requested");
    return localSite.getSiteDocument();
  };

  const getCodeFiles = () => {
    logger.verbose("code files requested");
    return localSite.getCodeFiles();
  };

  const updateSiteDocument = withCloneModeNotification(
    withBackup(async updatedDocument => {
      logger.verbose("updating local site document");
      const result = await localSite.updateSiteDocument(updatedDocument);
      logger.verbose("updating local site document done");
      notifyAdmin("document-updated");
      wasSiteDocumentUpdated = true;
      return result;
    })
  );

  const updateCodeFiles = withCloneModeNotification(async codeFileUpdates => {
    logger.verbose("updating local code files");
    const result = await localSite.updateCode(codeFileUpdates);
    logger.verbose("updating local code files done");
    notifyAdmin("code-updated");
    wereCodeFilesUpdated = true;
    return result;
  });

  const onCodeChanged = callback => localSite.onCodeChanged(callback);
  const onDocumentChanged = callback => localSite.onDocumentChanged(callback);

  const serverApi = {
    getEditorPort,
    isEditorConnected,
    getServerVersion,
    isCloneMode,
    getSiteDocument,
    updateSiteDocument,
    getCodeFiles,
    updateCodeFiles,
    onCodeChanged,
    onDocumentChanged
  };

  const adminSocketHandler = adminSocketApi(serverApi);
  const editorSocketHandler = editorSocketApi(serverApi);

  adminServer.io.on("connection", adminSocket => {
    logger.verbose("admin connected");
    adminSocket.on("disconnect", () => {
      logger.verbose("admin disconnected");
    });
    return adminSocketHandler(adminSocket);
  });

  editorServer.io.on("connection", editorSocket => {
    logger.verbose("editor connected");
    notifyAdmin("editor-connected");
    editorSocket.on("disconnect", () => {
      logger.verbose("editor disconnected");
      notifyAdmin("editor-disconnected");
    });
    return editorSocketHandler(editorSocket);
  });
};

module.exports = initServerApi;
