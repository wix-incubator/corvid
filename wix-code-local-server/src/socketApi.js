const initApi = localSite => ({
  IS_CLONE_MODE: () => localSite.isEmpty(),
  GET_DOCUMENT: () => localSite.getSiteDocument(),
  UPDATE_DOCUMENT: newDocument => localSite.updateSiteDocument(newDocument),
  GET_CODE: () => localSite.getCodeFiles(),
  UPDATE_CODE: codeUpdates => localSite.updateCode(codeUpdates)
});

const handleRequest = handler => (payload, callback) => {
  return Promise.resolve(handler(payload))
    .then(result => callback(null, result))
    .catch(err => callback(err));
};

const socketHandler = localSite => socket => {
  const socketApi = initApi(localSite);
  Object.keys(socketApi).forEach(event => {
    socket.on(event, handleRequest(socketApi[event]));
  });
  localSite.onCodeChanged((...args) => {
    socket.emit("LOCAL_CODE_UPDATED", ...args);
  });
};

module.exports = socketHandler;
