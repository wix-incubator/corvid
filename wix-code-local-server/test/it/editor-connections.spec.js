const eventually = require("@wix/wix-eventually");
const { editor: loadEditor } = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite } = require("../utils/localSiteDir");

describe("editor connections", () => {
  it("should allow one editor to connect", async () => {
    const localSiteDir = await initLocalSite({});

    const server = await localServer.startInCloneMode(localSiteDir);
    const editor = await loadEditor(server.port);

    expect(editor.isConnected()).toBe(true);

    await editor.close();
    await server.close();
  });

  it("should block multiple connections", async () => {
    const localSiteDir = await initLocalSite({});
    const server = await localServer.startInCloneMode(localSiteDir);

    const editor1 = await loadEditor(server.port);
    await expect(loadEditor(server.port)).rejects.toThrow(
      "ONLY_ONE_CONNECTION_ALLOWED"
    );

    await editor1.close();
    await server.close();
  });

  it("should allow an editor to connect if a previously connected editor already closed", async () => {
    const localSiteDir = await initLocalSite({});
    const server = await localServer.startInCloneMode(localSiteDir);
    const editor1 = await loadEditor(server.port);

    await editor1.close();

    await eventually(async () => {
      const editor2 = await loadEditor(server.port);
      expect(editor2.isConnected()).toBe(true);
      await editor2.close();
    });

    await server.close();
  });

  // TODO: should reconnect when server reloads
});
