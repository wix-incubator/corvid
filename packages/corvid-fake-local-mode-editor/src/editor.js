const io = require("socket.io-client");
const flat = require("flat");
const cloneDeep_ = require("lodash/cloneDeep");
const flow_ = require("lodash/flow");
const mapValues_ = require("lodash/mapValues");
const map_ = require("lodash/map");
const pickBy_ = require("lodash/pickBy");
const isArray_ = require("lodash/isArray");
const set_ = require("lodash/set");
const head_ = require("lodash/head");
const reduce_ = require("lodash/reduce");
const noop_ = require("lodash/noop");
const get_ = require("lodash/get");
const expect = require("expect");
const atob = require("atob");

const flatten = data => flat(data, { delimiter: "/", safe: true });
const unflatten = data => flat.unflatten(data, { delimiter: "/", safe: true });

const getLocalServerURL = port => `http://localhost:${port}`;

// TODO: refactor schemas to be something different than code. than we won't need to handle it in such a weird way

const isSchemaPath = filePath => filePath.startsWith(".schemas/");

const ensureSchemaStructure = schemaContent =>
  JSON.stringify(JSON.parse(schemaContent));

const connectToLocalServer = port => {
  return new Promise((resolve, reject) => {
    const socket = io.connect(getLocalServerURL(port), {
      transportOptions: {
        polling: {
          extraHeaders: {
            origin: "https://editor.wix.com"
          }
        }
      }
    });

    const rejectConnection = reason => {
      socket.removeAllListeners();
      reject(new Error(reason));
    };

    const resolveConnection = () => {
      socket.removeAllListeners();
      resolve(socket);
    };

    socket.once("error", rejectConnection);
    socket.once("connect_error", rejectConnection);
    socket.once("connect_timeout", rejectConnection);
    socket.once("disconnect", rejectConnection);
    socket.once("connect", resolveConnection);
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

const calculateCodeFileChanges = codeFiles => {
  const previousFlat = flatten(codeFiles.previous);
  const currentFlat = flatten(codeFiles.current);

  const modified = pickBy_(
    currentFlat,
    (currentContent, filePath) =>
      currentContent !== null &&
      !isArray_(currentContent) &&
      currentContent !== previousFlat[filePath]
  );

  const modifiedFiles = map_(modified, (content, path) => ({ path, content }));

  const deletedFiles = map_(
    pickBy_(currentFlat, currentContent => currentContent === null),
    (content, path) => ({ path })
  );

  const copiedFiles = Object.keys(currentFlat)
    .filter(targetPath => isArray_(currentFlat[targetPath]))
    .map(targetPath => ({
      source: { path: head_(currentFlat[targetPath]) },
      target: { path: targetPath }
    }));

  return {
    modifiedFiles,
    deletedFiles,
    copiedFiles
  };
};

const decodePageContent = payload => {
  const decode = flow_([atob, escape, decodeURIComponent, JSON.parse]);
  return decode(payload);
};

const getElementsMapFromEncodedContent = content => {
  const { elementsMap } = decodePageContent(content);
  return elementsMap;
};

const generateCodeIntelligencePayload = siteDocument => ({
  elementsMap: {
    pages: get_(siteDocument, "pages")
      ? mapValues_(siteDocument.pages, page =>
          getElementsMapFromEncodedContent(page.content)
        )
      : {},
    site: {
      commonComponents: get_(siteDocument, ["site", "commonComponents"])
        ? getElementsMapFromEncodedContent(
            siteDocument.site.commonComponents.content
          )
        : {}
    }
  }
});

const getCurrentCodeFiles = codeFiles => {
  const flattened = flatten(codeFiles.current);
  const withCopied = mapValues_(flattened, value =>
    isArray_(value) ? flattened[head_(value)] : value
  );
  const withoutDeleted = pickBy_(withCopied, content => content !== null);
  return unflatten(withoutDeleted);
};

const getCodeFilesFromServer = async socket => {
  const codeFiles = await sendRequest(socket, "GET_CODE");
  expect(codeFiles).toEqual(expect.any(Array));
  codeFiles.forEach(file => {
    expect(file.path).toEqual(expect.any(String));
    expect(file.content).toEqual(expect.any(String));
  });
  return codeFiles.filter(code => code.content !== "");
};

const getSiteDocumentFromServer = async socket =>
  sendRequest(socket, "GET_DOCUMENT");

const loadEditor = async (
  port,
  { siteDocument: initialSiteDocument, siteCode: initialSiteCode } = {},
  { cloneOnLoad = true, failOnClone = false } = {}
) => {
  const codeChangesLocallyHandler = payload => {
    payload.modifiedFiles.forEach(file => {
      modifyCodeFile(file.path, file.content);
    });
    payload.deletedFiles.forEach(file => {
      deleteCodeFile(file.path);
    });
  };
  const editorState = {
    siteDocument: initialSiteDocument || {},
    codeFiles: {
      previous: {},
      current: initialSiteCode || {}
    },
    codeChangesLocally: [codeChangesLocallyHandler],
    documentChangesLocally: [noop_]
  };

  const saveSiteDocument = async () =>
    sendRequest(socket, "UPDATE_DOCUMENT", editorState.siteDocument);

  const saveCodeIntelligence = async () =>
    sendRequest(
      socket,
      "UPDATE_CODE_INTELLIGENCE",
      generateCodeIntelligencePayload(editorState.siteDocument)
    );

  const saveCodeFiles = async () => {
    const codeFileChanges = calculateCodeFileChanges(editorState.codeFiles);
    await sendRequest(socket, "UPDATE_CODE", codeFileChanges);
    const currentCodeFiles = getCurrentCodeFiles(editorState.codeFiles);
    editorState.codeFiles = {
      previous: currentCodeFiles,
      current: currentCodeFiles
    };
  };

  const saveLocal = async () => {
    const savePromise = Promise.all([
      saveSiteDocument(),
      saveCodeFiles(),
      saveCodeIntelligence()
    ]);
    if (failOnClone) {
      // eslint-disable-next-line no-console
      console.log("[CORVID] failOnClone is set");
    }
    await savePromise;
  };

  const socket = await connectToLocalServer(port);
  if (socket.connected) {
    try {
      const isInCloneMode = await isCloneMode(socket);
      if (isInCloneMode) {
        if (cloneOnLoad) {
          await saveLocal();
        }
      } else {
        editorState.codeFiles.current = unflatten(
          reduce_(
            await getCodeFilesFromServer(socket),
            (result, value) =>
              Object.assign(result, {
                [value.path]: isSchemaPath(value.path)
                  ? ensureSchemaStructure(value.content)
                  : value.content
              }),
            {}
          )
        );
        editorState.siteDocument = await getSiteDocumentFromServer(socket);
      }
      socket.on("LOCAL_CODE_UPDATED", payload => {
        editorState.codeChangesLocally.forEach(cb => cb(payload));
      });

      socket.on("LOCAL_DOCUMENT_UPDATED", () => {
        editorState.documentChangesLocally.forEach(cb => cb());
      });
    } catch (error) {
      socket.disconnect();
      throw error;
    }
  }

  const modifyCodeFile = (filePath, content) => {
    if (isSchemaPath(filePath)) {
      content = ensureSchemaStructure(content);
    }
    set_(editorState.codeFiles.current, filePath.split("/"), content);
  };

  const copyCodeFile = (sourcePath, targetPath) => {
    set_(editorState.codeFiles.current, targetPath.split("/"), [sourcePath]);
  };
  const deleteCodeFile = filePath => {
    set_(editorState.codeFiles.current, filePath.split("/"), null);
  };

  const modifyPageCodeFile = (pageId, content) => {
    set_(
      editorState.codeFiles.current,
      ["public", "pages", `${pageId}.js`],
      content
    );
  };
  const deletePageCodeFile = pageId => {
    set_(
      editorState.codeFiles.current,
      ["public", "pages", `${pageId}.js`],
      null
    );
  };

  const deletePage = pageId => {
    delete editorState.siteDocument.pages[pageId];
  };

  const togglePageLightbox = pageId => {
    const pageOrLightbox = editorState.siteDocument.pages[pageId];
    pageOrLightbox.isPopup = !pageOrLightbox.isPopup;
  };

  const registerDocumentChange = cb => {
    editorState.documentChangesLocally.push(cb);
    return () => {
      const index = editorState.documentChangesLocally.indexOf(cb);
      editorState.documentChangesLocally.splice(index, 1);
    };
  };

  const registerCodeChange = cb => {
    editorState.codeChangesLocally.push(cb);
    return () => {
      const index = editorState.codeChangesLocally.indexOf(cb);
      editorState.codeChangesLocally.splice(index, 1);
    };
  };

  return {
    save: async () => {
      await saveLocal();
    },
    close: () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    },
    isConnected: () => !!(socket && socket.connected),

    getSite: () =>
      cloneDeep_({
        siteDocument: editorState.siteDocument,
        siteCode: getCurrentCodeFiles(editorState.codeFiles)
      }),

    modifyDocument: newDocumnet => {
      editorState.siteDocument = newDocumnet;
    },
    modifySite: newSite => {
      editorState.siteDocument = newSite.siteDocument;
      editorState.codeFiles = {
        previous: editorState.codeFiles.current,
        current: newSite.siteCode
      };
    },

    registerDocumentChange,
    registerCodeChange,
    advanced: {
      saveCodeIntelligence,
      saveSiteDocument,
      saveCodeFiles
    },

    // TODO: move to editorSiteBuilder ?
    modifyCodeFile,
    modifyPageCodeFile,
    copyCodeFile,
    deleteCodeFile,
    deletePageCodeFile,
    deletePage,
    togglePageLightbox
  };
};

module.exports = loadEditor;
