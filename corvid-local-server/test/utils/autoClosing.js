const { withClose } = require("corvid-local-test-utils");
const { editor } = require("fake-local-mode-editor");
const localServer = require("../../src/server");
const fakeCli = require("./fakeCli");

module.exports = {
  localServer: {
    startInCloneMode: withClose.add(localServer.startInCloneMode),
    startInEditMode: withClose.add(localServer.startInEditMode)
  },
  editor: withClose.add(editor),
  fakeCli: withClose.add(fakeCli),
  closeAll: withClose.closeAll
};
