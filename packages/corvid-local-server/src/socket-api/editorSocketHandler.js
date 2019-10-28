const socketRequestHandler = require("./utils/socketRequestHandler");

const initEditorApi = editorApi => ({
  IS_CLONE_MODE: () => editorApi.isCloneMode(),
  GET_DOCUMENT: () => editorApi.getSiteDocument(),
  UPDATE_DOCUMENT: newDocument => editorApi.updateSiteDocument(newDocument),
  GET_CODE: () => editorApi.getCodeFiles(),
  UPDATE_CODE: codeUpdates => editorApi.updateCodeFiles(codeUpdates),
  HANDSHAKE: () => editorApi.handshake(),
  USER_MESSAGE: message => editorApi.userMessage(message),
  UPDATE_CODE_INTELLIGENCE: codeIntelligence =>
    editorApi.updateCodeIntelligence(codeIntelligence)
});

const socketHandler = editorApi => {
  let currentSocket;
  editorApi.onCodeChanged(localCodePayload => {
    if (editorApi.isEditorConnected()) {
      currentSocket.emit("LOCAL_CODE_UPDATED", localCodePayload);
    }
  });
  editorApi.onDocumentChanged(() => {
    if (editorApi.isEditorConnected()) {
      currentSocket.emit("LOCAL_DOCUMENT_UPDATED");
    }
  });
  return socket => {
    currentSocket = socket;
    const socketApi = initEditorApi(editorApi);
    const handleSocketRequests = socketRequestHandler(socketApi);
    handleSocketRequests(socket);
  };
};

module.exports = socketHandler;
