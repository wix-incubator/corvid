const socketRequestHandler = require("./utils/socketRequestHandler");

const initEditorApi = localSite => ({
  IS_CLONE_MODE: () => localSite.isEmpty(),
  GET_DOCUMENT: () => localSite.getSiteDocument(),
  UPDATE_DOCUMENT: newDocument => localSite.updateSiteDocument(newDocument),
  GET_CODE: () => localSite.getCodeFiles(),
  UPDATE_CODE: codeUpdates => localSite.updateCode(codeUpdates)
});

const socketHandler = localSite => socket => {
  const socketApi = initEditorApi(localSite);
  const handleSocketRequests = socketRequestHandler(socketApi);
  handleSocketRequests(socket);
  localSite.onCodeChanged((...args) => {
    // eslint-disable-next-line no-console
    console.log("local code updated", args[0], args[1]);
    socket.emit("LOCAL_CODE_UPDATED", ...args);
  });
};

module.exports = socketHandler;
