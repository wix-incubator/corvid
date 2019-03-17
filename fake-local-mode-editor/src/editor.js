const io = require("socket.io-client");
const path = require("path");
const _ = require("lodash");
const flat = require("flat");

const flatten = data => flat(data, { delimiter: path.sep, safe: true });
const unflatten = data =>
  flat.unflatten(data, { delimiter: path.sep, safe: true });

const getLocalServerURL = port => `http://localhost:${port}`;

const connectToLocalServer = port => {
  return new Promise((resolve, reject) => {
    const socket = io.connect(getLocalServerURL(port));
    socket.once("connect_error", error => {
      socket.removeAllListeners();
      reject(["CONNECT_ERROR", error]);
    });
    socket.once("connect_timeout", error => {
      socket.removeAllListeners();
      reject(["CONNECT_TIMEOUT", error]);
    });
    socket.once("disconnect", reason => {
      socket.removeAllListeners();
      reject(["DISCONNECTED", reason]);
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

const updateCodeFiles = (socket, codeFileModifications) =>
  sendRequest(socket, "UPDATE_CODE", codeFileModifications);

const saveLocal = async (socket, siteDocument, codeFiles) => {
  await updateSiteDocument(socket, siteDocument);
  const codeFileChanges = calculateCodeFileChanges(codeFiles);
  await updateCodeFiles(socket, codeFileChanges);
  const currentCodeFiles = getCurrentCodeFiles(codeFiles);
  return {
    codeFiles: {
      previous: currentCodeFiles,
      current: currentCodeFiles
    }
  };
};

const calculateCodeFileChanges = codeFiles => {
  const previousFlat = flatten(codeFiles.previous);
  const currentFlat = flatten(codeFiles.current);
  return {
    modifiedFiles: _.pickBy(
      currentFlat,
      (currentContent, filePath) =>
        currentContent !== null &&
        !_.isArray(currentContent) &&
        currentContent !== previousFlat[filePath]
    ),
    deletedFiles: Object.keys(
      _.pickBy(currentFlat, currentContent => currentContent === null)
    ),
    copiedFiles: Object.keys(currentFlat)
      .filter(targetPath => _.isArray(currentFlat[targetPath]))
      .map(targetPath => ({
        sourcePath: _.head(currentFlat[targetPath]),
        targetPath
      }))
  };
};

const getCurrentCodeFiles = codeFiles => {
  const flattened = flatten(codeFiles.current);
  const withCopied = _.mapValues(flattened, value =>
    _.isArray(value) ? flattened[_.head(value)] : value
  );
  const withoutDeleted = _.pickBy(withCopied, content => content !== null);
  return unflatten(withoutDeleted);
};

const getCodeFilesFromServer = async socket => sendRequest(socket, "GET_CODE");
const getSiteDocumentFromServer = async socket =>
  sendRequest(socket, "GET_DOCUMENT");

const loadEditor = async (
  port,
  { siteDocument: remoteSiteDocument, siteCode: remoteSiteCode } = {}
) => {
  let siteDocument = remoteSiteDocument || {};
  let codeFiles = {
    previous: {},
    current: remoteSiteCode || {}
  };

  const socket = await connectToLocalServer(port);
  if (socket.connected) {
    const isInCloneMode = await isCloneMode(socket);
    if (isInCloneMode) {
      const saveResult = await saveLocal(socket, siteDocument, codeFiles);
      codeFiles = saveResult.codeFiles;
    } else {
      codeFiles.current = unflatten(await getCodeFilesFromServer(socket));
      siteDocument = await getSiteDocumentFromServer(socket);
    }
    socket.on("LOCAL_CODE_UPDATED", (action, ...args) => {
      switch (action) {
        case "add":
        case "change":
          modifyCodeFile(...args);
          break;
        case "delete":
          deleteCodeFile(...args);
          break;

        default:
          break;
      }
    });
  }

  const modifyCodeFile = (filePath, content) => {
    _.set(codeFiles.current, filePath.split(path.sep), content);
  };

  const copyCodeFile = (sourcePath, targetPath) => {
    _.set(codeFiles.current, targetPath.split(path.sep), [sourcePath]);
  };
  const deleteCodeFile = filePath => {
    _.set(codeFiles.current, filePath.split(path.sep), null);
  };

  return {
    save: async () => {
      const saveResult = await saveLocal(socket, siteDocument, codeFiles);
      codeFiles = saveResult.codeFiles;
    },
    close: () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    },
    isConnected: () => !!(socket && socket.connected),
    getSiteDocument: () => siteDocument,
    modifyDocument: newDocumnet => {
      siteDocument = newDocumnet;
    },
    getCodeFiles: () => getCurrentCodeFiles(codeFiles),
    modifyCodeFile,
    copyCodeFile,
    deleteCodeFile
  };
};

module.exports = loadEditor;
