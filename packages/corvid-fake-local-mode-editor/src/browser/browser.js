/* global window */
const loadEditor = require("../editor");

const urlParams = new URLSearchParams(window.location.search);
const localServerPort = urlParams.get("localServerPort");
const corvidSessionId = urlParams.get("corvidSessionId");

window.loadEditor = options => {
  loadEditor(
    { port: localServerPort, corvidSessionId },
    undefined,
    options
  ).then(fakeEditor =>
    window.fetch("/editor-loaded").then(() => fakeEditor.close())
  );
};
