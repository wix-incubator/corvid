const socketRequestHandler = require("./utils/socketRequestHandler");

const initEditorApi = editorApi => ({
  IS_CLONE_MODE: () => editorApi.isCloneMode(),
  GET_DOCUMENT: () => editorApi.getSiteDocument(),
  UPDATE_DOCUMENT: newDocument => editorApi.updateSiteDocument(newDocument),
  GET_CODE: () => editorApi.getCodeFiles(),
  UPDATE_CODE: codeUpdates => editorApi.updateCodeFiles(codeUpdates),
  GET_SERVER_VERSION: () => editorApi.getServerVersion()
});

const socketHandler = editorApi => socket => {
  const socketApi = initEditorApi(editorApi);
  const handleSocketRequests = socketRequestHandler(socketApi);
  handleSocketRequests(socket);
  editorApi.onCodeChanged(localCodePayload => {
    socket.emit("LOCAL_CODE_UPDATED", localCodePayload);
  });
  editorApi.onDocumentChanged(() => {
    socket.emit("LOCAL_DOCUMENT_UPDATED");
  });
};

module.exports = socketHandler;
