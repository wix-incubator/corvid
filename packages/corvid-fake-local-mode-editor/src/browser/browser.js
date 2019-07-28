/* global window */
const loadEditor = require("../editor");

const urlParams = new URLSearchParams(window.location.search);
const localServerPort = urlParams.get("localServerPort");

window.loadEditor = options => {
  loadEditor(localServerPort, undefined, options).then(fakeEditor =>
    window.fetch("/editor-loaded").then(() => fakeEditor.close())
  );
};
