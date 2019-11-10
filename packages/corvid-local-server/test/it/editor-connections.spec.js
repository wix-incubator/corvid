const eventually = require("wix-eventually");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite },
  getEditorOptions
} = require("corvid-local-test-utils");

afterEach(closeAll);

describe("editor connections", () => {
  it("should allow one editor to connect", async () => {
    const localSiteDir = await initLocalSite();

    const server = await localServer.startInCloneMode(localSiteDir);
    const editor = await loadEditor(getEditorOptions(server));

    expect(editor.isConnected()).toBe(true);
  });

  it("should block multiple connections", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);

    await loadEditor(getEditorOptions(server));
    await expect(loadEditor(getEditorOptions(server))).rejects.toThrow(
      "ONLY_ONE_CONNECTION_ALLOWED"
    );
  });

  it("should allow an editor to connect if a previously connected editor already closed", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    const editor1 = await loadEditor(getEditorOptions(server));

    await editor1.close();

    await eventually(async () => {
      const editor2 = await loadEditor(getEditorOptions(server));
      expect(editor2.isConnected()).toBe(true);
    });
  });

  it("should not allow an editor to connect with wrong token (corvidSessionId)", async () => {
    const localSiteDir = await initLocalSite();

    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(
      loadEditor({
        port: server.port,
        corvidSessionId: "wrong-token"
      })
    ).rejects.toThrow("WRONG_CORVID_SESSION_ID");
  });

  // TODO: should reconnect when server reloads
});
