const io = require("socket.io-client");
const path = require("path");
const _ = require("lodash");

const getLocalServerURL = port => `http://localhost:${port}`;

const connectToLocalServer = port => {
  return new Promise((resolve, reject) => {
    const socket = io.connect(getLocalServerURL(port));
    socket.once("disconnect", () => {
      socket.removeAllListeners();
      socket.close();
      reject();
    });
    socket.once("connected", () => {
      socket.removeAllListeners();
      resolve(socket);
    });
  });
};

const sendRequest = async (socket, event, payload) =>
  new Promise((resolve, reject) => {
    socket.emit(event, payload, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });

const isCloneMode = async socket => sendRequest(socket, "IS_CLONE_MODE");

const updateSiteDocument = async (socket, siteDocument) =>
  sendRequest(socket, "UPDATE_DOCUMENT", siteDocument);

const saveLocal = async (socket, siteDocument) => {
  await updateSiteDocument(socket, siteDocument);
};

const setValueAtPath = (fullPath, value) => {
  if (fullPath.length === 0) {
    return value;
  }
  const parts = fullPath.split(path.sep);
  const [head, ...tail] = parts;
  return { [head]: setValueAtPath(tail.join(path.sep), value) };
};

const toHierarchy = data =>
  Object.keys(data).reduce(
    (result, fullPath) =>
      _.merge(result, setValueAtPath(fullPath, data[fullPath])),
    {}
  );

const getCodeFilesFromServer = async socket => sendRequest(socket, "GET_CODE");

const loadEditor = async (port, { siteDocument: remoteSiteDocument } = {}) => {
  const siteDocument = remoteSiteDocument;
  let codeFiles = {};

  let socket;
  try {
    socket = await connectToLocalServer(port);

    const isInCloneMode = await isCloneMode(socket);
    if (isInCloneMode) {
      await saveLocal(socket, siteDocument);
    } else {
      codeFiles = toHierarchy(await getCodeFilesFromServer(socket));
    }
  } catch (err) {
    // TODO: handle connection error
    console.error(err); // eslint-disable-line no-console
  }

  return {
    close: () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    },
    isConnected: () => !!(socket && socket.connected),
    // getDocument,
    getCodeFiles: () => codeFiles
    // save,
    // modifyDocument,
    // modifyCode
  };
};

module.exports = loadEditor;
