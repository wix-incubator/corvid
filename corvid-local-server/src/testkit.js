const server = require("./server");

// TODO: testkit should start the server with a mock filesystem implementation

module.exports = {
  startInCloneMode: server.startInCloneMode,
  startInEditMode: server.startInEditMode
};
