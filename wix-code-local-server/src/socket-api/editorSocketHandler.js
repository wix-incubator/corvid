const socketRequestHandler = require("./utils/socketRequestHandler");
const { logger } = require("@wix/wix-code-local-site");

const initEditorApi = (localSite, adminSocket) => ({
  IS_CLONE_MODE: () => localSite.isEmpty(),
  GET_DOCUMENT: () => localSite.getSiteDocument(),
  UPDATE_DOCUMENT: newDocument => {
    const result = localSite.updateSiteDocument(newDocument);
    adminSocket.emit("document-updated");
    return result;
  },
  GET_CODE: () => localSite.getCodeFiles(),
  UPDATE_CODE: codeUpdates => {
    const result = localSite.updateCode(codeUpdates);
    adminSocket.emit("code-updated");
    return result;
  }
});

const socketHandler = (localSite, adminSocket) => socket => {
  const socketApi = initEditorApi(localSite, adminSocket);
  const handleSocketRequests = socketRequestHandler(socketApi);
  handleSocketRequests(socket);
  localSite.onCodeChanged((...args) => {
    logger.log("local code updated", args[0], args[1]);
    socket.emit("LOCAL_CODE_UPDATED", ...args);
  });
};

module.exports = socketHandler;
