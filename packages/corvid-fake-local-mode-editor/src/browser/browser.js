/* global window */
const loadEditor = require("../editor");
const { URLSearchParams } = require("url");

const urlParams = new URLSearchParams(window.location.search);
const localServerPort = urlParams.get("localServerPort");

loadEditor(localServerPort).then(async fakeEditor => {
  fakeEditor.close();
});
