const socketRequestHandler = require("./utils/socketRequestHandler");

const initAdminApi = serverState => ({
  GET_STATUS: () => ({
    editorPort: serverState.editorPort(),
    editorConnected: serverState.isEditorConnected(),
    mode: serverState.isCloneMode() ? "clone" : "edit"
  })
});

const socketHandler = serverState => socket => {
  const socketApi = initAdminApi(serverState);
  const handleSocketRequests = socketRequestHandler(socketApi);
  handleSocketRequests(socket);
};

module.exports = socketHandler;
