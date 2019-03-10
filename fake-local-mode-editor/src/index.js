const io = require("socket.io-client");

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

const overrideDocument = async (socket, siteDocument) =>
  sendRequest(socket, "OVERRIDE_DOCUMENT", siteDocument);

const saveLocal = async (socket, siteDocument) => {
  await overrideDocument(socket, siteDocument);
};

const loadEditor = async (port, { siteDocument: remoteSiteDocument } = {}) => {
  const siteDocument = remoteSiteDocument;

  let socket;
  try {
    socket = await connectToLocalServer(port);
    await saveLocal(socket, siteDocument);
  } catch (err) {
    // TODO: handle connection error
  }

  return {
    close: () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    },
    isConnected: () => !!(socket && socket.connected)
    // getDocument,
    // getCode,
    // save,
    // modifyDocument,
    // modifyCode
  };
};

module.exports = loadEditor;
