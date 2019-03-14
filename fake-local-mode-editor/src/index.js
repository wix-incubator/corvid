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
      reject("MULTIPLE_CONNECTIONS_SOCKET_DISCONECTED");
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

const updateCodeFiles = async (socket, codeFiles) =>
  sendRequest(socket, "UPDATE_CODE", codeFiles);

const saveLocal = async (socket, siteDocument, codeFiles) => {
  await updateSiteDocument(socket, siteDocument);
  await updateCodeFiles(socket, codeFiles);
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
const getSiteDocumentFromServer = async socket =>
  sendRequest(socket, "GET_DOCUMENT");

const loadEditor = async (
  port,
  { siteDocument: remoteSiteDocument, siteCode: remoteSiteCode } = {}
) => {
  let siteDocument = remoteSiteDocument || {};
  let codeFiles = remoteSiteCode || {};

  let socket;
  try {
    socket = await connectToLocalServer(port);
    if (socket.connected) {
      const isInCloneMode = await isCloneMode(socket);
      if (isInCloneMode) {
        await saveLocal(socket, siteDocument, codeFiles);
      } else {
        codeFiles = toHierarchy(await getCodeFilesFromServer(socket));
        siteDocument = await getSiteDocumentFromServer(socket);
      }
    }
  } catch (err) {
    // TODO: handle connection error
    console.log(err); // eslint-disable-line no-console
  }

  return {
    close: () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    },
    isConnected: () => !!(socket && socket.connected),
    getSiteDocument: () => siteDocument,
    getCodeFiles: () => codeFiles,
    save: () => saveLocal(socket, siteDocument, codeFiles),
    updateCode: request => updateCodeFiles(socket, request),
    modifyDocument: newDocumnet => {
      siteDocument = newDocumnet;
    }
  };
};

module.exports = loadEditor;
