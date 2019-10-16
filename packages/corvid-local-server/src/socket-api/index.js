const { version: serverVersion } = require("../../package.json");
const logger = require("corvid-local-logger");
const editorSocketApi = require("./editorSocketHandler");
const adminSocketApi = require("./adminSocketHandler");
const getMessage = require("../messages");
const { editorApiVersion } = require("../versions.json");
const {
  versions: { supportedSiteDocumentVersion }
} = require("corvid-local-site");

const initServerApi = (
  localSite,
  adminServer,
  editorServer,
  loadedInCloneMode
) => {
  const notifyAdmin = (event, payload) =>
    adminServer.io.sockets.emit(event, payload);

  let wasSiteDocumentUpdated = false;
  let wasCodeFilesUpdated = false;
  let wasCodeIntelligenceUpdated = false;

  const handshake = () => ({
    editorApiVersion,
    supportedSiteDocumentVersion,
    serverVersion
  });

  const wasSiteSaved = () =>
    wasSiteDocumentUpdated && wasCodeFilesUpdated && wasCodeIntelligenceUpdated;

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

  const getEditorPort = () => editorServer.port;

  const isEditorConnected = () =>
    Object.keys(editorServer.io.sockets.connected).length > 0;

  const getSiteDocument = () => {
    return localSite.getSiteDocument();
  };

  const getCodeFiles = () => {
    return localSite.getCodeFiles();
  };

  const updateSiteDocument = withCloneModeNotification(
    async updatedDocument => {
      const result = await localSite.updateSiteDocument(updatedDocument);
      notifyAdmin("document-updated");
      wasSiteDocumentUpdated = true;
      return result;
    }
  );

  const updateCodeFiles = withCloneModeNotification(async codeFileUpdates => {
    const result = await localSite.updateCode(codeFileUpdates);
    notifyAdmin("code-updated");
    wasCodeFilesUpdated = true;
    return result;
  });

  const updateCodeIntelligence = withCloneModeNotification(
    async codeIntelligence => {
      const result = await localSite.updateCodeIntelligence(codeIntelligence);
      notifyAdmin("code-intelligence-updated");
      wasCodeIntelligenceUpdated = true;
      return result;
    }
  );

  const onCodeChanged = callback => localSite.onCodeChanged(callback);
  const onDocumentChanged = callback => localSite.onDocumentChanged(callback);

  const userMessage = message => notifyAdmin("user-message", message);

  const serverApi = {
    getEditorPort,
    isEditorConnected,
    handshake,
    isCloneMode,
    getSiteDocument,
    updateSiteDocument,
    getCodeFiles,
    updateCodeFiles,
    updateCodeIntelligence,
    onCodeChanged,
    onDocumentChanged,
    userMessage
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
