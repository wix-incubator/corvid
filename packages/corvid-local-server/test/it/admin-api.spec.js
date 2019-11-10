const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const {
  editor: loadEditor,
  fakeCli: connectCli,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite },
  getEditorOptions
} = require("corvid-local-test-utils");

afterEach(closeAll);

describe("admin api", () => {
  describe("GET_STATUS", () => {
    it("should return when editor is disconnected and in clone mode", async () => {
      const localSiteDir = await initLocalSite();

      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: false,
        mode: "clone"
      });
    });

    it("should return when editor is disconnected and in edit mode", async () => {
      const localSiteDir = await initLocalSite(localSiteBuilder.buildFull());

      const server = await localServer.startInEditMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: false,
        mode: "edit"
      });
    });

    it("should return when editor is connected and in clone mode", async () => {
      const localSiteDir = await initLocalSite();

      const server = await localServer.startInCloneMode(localSiteDir);
      await loadEditor(
        getEditorOptions(server),
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );
      const cli = await connectCli(server.adminPort, server.adminToken);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: true,
        mode: "clone"
      });
    });

    it("should return when editor is connected and in edit mode", async () => {
      const localSiteDir = await initLocalSite(localSiteBuilder.buildFull());

      const server = await localServer.startInEditMode(localSiteDir);
      await loadEditor(getEditorOptions(server), editorSiteBuilder.buildFull());
      const cli = await connectCli(server.adminPort, server.adminToken);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: true,
        mode: "edit"
      });
    });
  });

  describe("clone-complete", () => {
    it("should be sent when cloning the site has ended", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      await loadEditor(getEditorOptions(server), editorSiteBuilder.buildFull());

      expect(cloneCompleteSpy).toHaveBeenCalledTimes(1);
    });

    it("should not be sent before cloning started", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      await loadEditor(
        getEditorOptions(server),
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });

    it("should not be sent if document save hasn't been completed", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(
        getEditorOptions(server),
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );

      await editor.advanced.saveCodeIntelligence();
      await editor.advanced.saveCodeFiles();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });

    it("should not be sent if code files hasn't been completed", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(
        getEditorOptions(server),
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );

      await editor.advanced.saveCodeIntelligence();
      await editor.advanced.saveSiteDocument();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });
    it("should not be sent if code intelligence hasn't been completed", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort, server.adminToken);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(
        getEditorOptions(server),
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );

      await editor.advanced.saveCodeFiles();
      await editor.advanced.saveSiteDocument();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });
  });
});
