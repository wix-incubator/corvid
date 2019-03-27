const { version: moduleVersion } = require("../../package.json");
const editorSocketApi = require("./editorSocketHandler");
const adminSocketApi = require("./adminSocketHandler");

const initServerApi = (
  localSite,
  adminServer,
  editorServer,
  loadedInCloneMode
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
      notifyAdmin("clone-complete");
    }
    return result;
  };

  const getEditorPort = () => editorServer.port;

  const isEditorConnected = () =>
    Object.keys(editorServer.io.sockets.connected).length > 0;

  const getSiteDocument = () => localSite.getSiteDocument();

  const getCodeFiles = () => localSite.getCodeFiles();

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
    wereCodeFilesUpdated = true;
    return result;
  });

  const onCodeChanged = callback => localSite.onCodeChanged(callback);
  const onDocumentChanged = callback => localSite.onDocumentChanged(callback);

  const adminApi = {
    isCloneMode,
    getEditorPort,
    isEditorConnected,
    getServerVersion
  };

  const editorApi = {
    isCloneMode,
    getSiteDocument,
    updateSiteDocument,
    getCodeFiles,
    updateCodeFiles,
    onCodeChanged,
    onDocumentChanged,
    getServerVersion
  };

  const adminSocketHandler = adminSocketApi(adminApi);
  const editorSocketHandler = editorSocketApi(editorApi);

  adminServer.io.on("connection", adminSocketHandler);

  editorServer.io.on("connection", editorConnectionSocket => {
    notifyAdmin("editor-connected");
    editorConnectionSocket.on("disconnect", () => {
      notifyAdmin("editor-disconnected");
    });
    return editorSocketHandler(editorConnectionSocket);
  });
};

module.exports = initServerApi;
