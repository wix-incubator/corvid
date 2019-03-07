const io = require("socket.io-client");
const _ = require("lodash");
const getLocalServerURL = port => `http://localhost:${port}`;

const socketActions = {
  GET_VERSION: "GET_VERSION",
  IS_CLONE_MODE: "IS_CLONE_MODE",
  GET_DOCUMENT: "GET_DOCUMENT",
  OVERRIDE_DOCUMENT: "OVERRIDE_DOCUMENT",
  GET_CODE: "GET_CODE",
  UPDATE_CODE: "UPDATE_CODE"
};

const connectToLocalServer = port => {
  return new Promise(resolve => {
    const socket = io.connect(getLocalServerURL(port), {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": false,
      transports: ["websocket"]
    });
    socket.on("connect", () => {
      resolve(socket);
    });
  });
};

const isConnected = socket => !!_.get(socket, "connected");

const wrapCalbback = (callback, handleError) => (error, responsePayload) => {
  if (error) handleError(error);
  else callback(responsePayload);
};
const defaultErrorHandler = err => console.log(new Error(err)); // eslint-disable-line no-console
const emit = (
  socket,
  requestType,
  payload,
  callback,
  handleError = defaultErrorHandler
) => {
  socket.emit(requestType, payload, wrapCalbback(callback, handleError));
};
const close = socket => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// fake editor operations
const isCloneMode = (socket, callback, handleError) =>
  emit(socket, socketActions.IS_CLONE_MODE, undefined, callback, handleError);
const getDocument = (socket, callback, handleError) =>
  emit(socket, socketActions.GET_DOCUMENT, undefined, callback, handleError);
const overrideDocument = (socket, data, callback, handleError) =>
  emit(socket, socketActions.OVERRIDE_DOCUMENT, data, callback, handleError);
const getCode = (socket, callback, handleError) =>
  emit(socket, socketActions.GET_CODE, undefined, callback, handleError);
const updateCode = (socket, data, callback, handleError) =>
  emit(socket, socketActions.UPDATE_CODE, data, callback, handleError);

module.exports.fakeEditorCreator = async (siteData, port) => {
  const socket = await connectToLocalServer(port);
  let document = siteData.document || {};
  let code = siteData.code || {};
  let codeFiles = {};

  socket.on(socketActions.UPDATE_CODE, codeChanges => {
    codeFiles = Object.assign(codeFiles, codeChanges);
  });

  // fake operations
  const save = (callback = { document: undefined, code: undefined }) => {
    overrideDocument(socket, document, callback.document);
    updateCode(socket, code, callback.code);
  };

  // editor is nofitied when a user changes code and documents

  return _.mapValues(
    {
      isConnected,
      isCloneMode,
      close,
      getDocument,
      getCode,
      save,
      publish: () => {},
      modifyDocument: newDocument => Object.assign(document, newDocument),
      modifyCode: newCode => Object.assign(codeFiles, newCode)
    },
    fn => _.partial(fn, socket)
  );
};
