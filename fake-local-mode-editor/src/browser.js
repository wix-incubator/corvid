/* global window */
const loadEditor = require("./editor");

const urlParams = new URLSearchParams(window.location.search);
const localServerPort = urlParams.get("localServerPort");

loadEditor(localServerPort);
