/* global window */
const loadEditor = require("../editor");

const urlParams = new URLSearchParams(window.location.search);
const localServerPort = urlParams.get("localServerPort");

window.loadEditor = query => {
  const transformBooleans = value => {
    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        return value;
    }
  };
  const optionsFromQuery = Object.fromEntries(
    query.split("&").map(part => {
      const pair = part.split("=");
      return [pair[0], transformBooleans(pair[1])];
    })
  );
  loadEditor(localServerPort, undefined, optionsFromQuery).then(
    async fakeEditor => {
      fakeEditor.close();
    }
  );
};
