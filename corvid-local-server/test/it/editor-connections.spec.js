const eventually = require("wix-eventually");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { initLocalSiteWithConfig } = require("../utils/localSiteDir");

afterEach(closeAll);

describe("editor connections", () => {
  it("should allow one editor to connect", async () => {
    const localSiteDir = await initLocalSiteWithConfig();

    const server = await localServer.startInCloneMode(localSiteDir);
    const editor = await loadEditor(server.port);

    expect(editor.isConnected()).toBe(true);
  });

  it("should block multiple connections", async () => {
    const localSiteDir = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSiteDir);

    await loadEditor(server.port);
    await expect(loadEditor(server.port)).rejects.toThrow(
      "ONLY_ONE_CONNECTION_ALLOWED"
    );
  });

  it("should allow an editor to connect if a previously connected editor already closed", async () => {
    const localSiteDir = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSiteDir);
    const editor1 = await loadEditor(server.port);

    await editor1.close();

    await eventually(async () => {
      const editor2 = await loadEditor(server.port);
      expect(editor2.isConnected()).toBe(true);
    });
  });

  // TODO: should reconnect when server reloads
});
