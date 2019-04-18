const { withClose } = require("corvid-local-test-utils");
const { editor } = require("corvid-fake-local-mode-editor");
const localServer = require("../../src/server");
const fakeCli = require("./fakeCli");

const startInCloneModeTest = (rootPath, options = {}) =>
  localServer.startInCloneMode(rootPath, { ...options, test: true });

const startInEditModeTest = (rootPath, options = {}) =>
  localServer.startInEditMode(rootPath, { ...options, test: true });

module.exports = {
  localServer: {
    startInCloneMode: withClose.add(startInCloneModeTest),
    startInEditMode: withClose.add(startInEditModeTest)
  },
  editor: withClose.add(editor),
  fakeCli: withClose.add(fakeCli),
  closeAll: withClose.closeAll
};
