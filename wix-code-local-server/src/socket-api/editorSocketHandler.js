const socketRequestHandler = require("./utils/socketRequestHandler");

const initEditorApi = editorApi => ({
  IS_CLONE_MODE: () => editorApi.isCloneMode(),
  GET_DOCUMENT: () => editorApi.getSiteDocument(),
  UPDATE_DOCUMENT: newDocument => editorApi.updateSiteDocument(newDocument),
  GET_CODE: () => editorApi.getCodeFiles(),
  UPDATE_CODE: codeUpdates => editorApi.updateCodeFiles(codeUpdates)
});

const socketHandler = editorApi => socket => {
  const socketApi = initEditorApi(editorApi);
  const handleSocketRequests = socketRequestHandler(socketApi);
  handleSocketRequests(socket);
  editorApi.onCodeChanged((...args) => {
    // eslint-disable-next-line no-console
    console.log("local code updated", args[0], args[1]);
    socket.emit("LOCAL_CODE_UPDATED", ...args);
  });
};

module.exports = socketHandler;
