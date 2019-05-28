const { version: serverVersion } = require("../../package.json");
const logger = require("corvid-local-logger");
const editorSocketApi = require("./editorSocketHandler");
const adminSocketApi = require("./adminSocketHandler");
const backup = require("../backup");
const getMessage = require("../messages");
const {
  apiVersion,
  supportedSiteDocumentVersion
} = require("../versions.json");

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

  const handshake = () => ({
    apiVersion,
    supportedSiteDocumentVersion,
    serverVersion
  });

  const wasSiteSaved = () => wasSiteDocumentUpdated && wereCodeFilesUpdated;

  const isCloneMode = () => loadedInCloneMode && !wasSiteSaved();

  const withCloneModeNotification = asyncCallback => async (...args) => {
    const cloneModeBefore = isCloneMode();
    const result = await asyncCallback(...args);
    const cloneModeAfter = isCloneMode();
    if (cloneModeBefore && !cloneModeAfter) {
      logger.verbose(getMessage("Index_Clone_Complete_Log"));
      notifyAdmin("clone-complete");
    }
    return result;
  };

  const withBackup = backup.withBackupInit(siteRootPath, localSite);

  const getEditorPort = () => editorServer.port;

  const isEditorConnected = () =>
    Object.keys(editorServer.io.sockets.connected).length > 0;

  const getSiteDocument = () => {
    logger.verbose(getMessage("Index_Site_Document_Requested_Log"));
    return localSite.getSiteDocument();
  };

  const getCodeFiles = () => {
    logger.verbose("code files requested");
    return localSite.getCodeFiles();
  };

  const updateSiteDocument = withCloneModeNotification(
    withBackup(async updatedDocument => {
      logger.verbose(getMessage("Index_Update_Site_Document_Start_Log"));
      const result = await localSite.updateSiteDocument(updatedDocument);
      logger.verbose(getMessage("Index_Update_Site_Document_Complete_Log"));
      notifyAdmin("document-updated");
      wasSiteDocumentUpdated = true;
      return result;
    })
  );

  const updateCodeFiles = withCloneModeNotification(async codeFileUpdates => {
    logger.verbose(getMessage("Index_Update_Code_Files_Start_Log"));
    const result = await localSite.updateCode(codeFileUpdates);
    logger.verbose(getMessage("Index_Update_Code_Files_Complete_Log"));
    notifyAdmin("code-updated");
    wereCodeFilesUpdated = true;
    return result;
  });

  const onCodeChanged = callback => localSite.onCodeChanged(callback);
  const onDocumentChanged = callback => localSite.onDocumentChanged(callback);

  const serverApi = {
    getEditorPort,
    isEditorConnected,
    handshake,
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
    logger.verbose(getMessage("Index_Admin_Connected_Log"));
    adminSocket.on("disconnect", () => {
      logger.verbose(getMessage("Index_Admin_Disconnected_Log"));
    });
    return adminSocketHandler(adminSocket);
  });

  editorServer.io.on("connection", editorSocket => {
    logger.verbose(getMessage("Index_Editor_Connected_Log"));
    notifyAdmin("editor-connected");
    editorSocket.on("disconnect", () => {
      logger.verbose(getMessage("Index_Editor_Disconnected_Log"));
      notifyAdmin("editor-disconnected");
    });
    return editorSocketHandler(editorSocket);
  });
};

module.exports = initServerApi;
