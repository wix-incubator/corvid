const socketRequestHandler = require("./utils/socketRequestHandler");

const initAdminApi = adminApi => ({
  GET_STATUS: () => ({
    editorPort: adminApi.getEditorPort(),
    editorConnected: adminApi.isEditorConnected(),
    mode: adminApi.isCloneMode() ? "clone" : "edit"
  }),
  GET_SERVER_VERSION: () => adminApi.getServerVersion()
});

const socketHandler = adminApi => socket => {
  const socketApi = initAdminApi(adminApi);
  const handleSocketRequests = socketRequestHandler(socketApi);
  handleSocketRequests(socket);
};

module.exports = socketHandler;
