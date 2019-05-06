const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const {
  editor: loadEditor,
  fakeCli: connectCli,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { initLocalSite } = require("../utils/localSiteDir");

const token = "test_token";
const adminSocketOptions = {
  query: { token }
};

afterEach(closeAll);

describe("admin api", () => {
  describe("GET_STATUS", () => {
    it("should return when editor is disconnected and in clone mode", async () => {
      const localSiteDir = await initLocalSite();

      const server = await localServer.startInCloneMode(localSiteDir, {
        token
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: false,
        mode: "clone"
      });
    });

    it("should return when editor is disconnected and in edit mode", async () => {
      const localSiteDir = await initLocalSite(localSiteBuilder.buildFull());

      const server = await localServer.startInEditMode(localSiteDir, {
        token
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: false,
        mode: "edit"
      });
    });

    it("should return when editor is connected and in clone mode", async () => {
      const localSiteDir = await initLocalSite();

      const server = await localServer.startInCloneMode(localSiteDir, {
        token
      });
      await loadEditor(server.port, editorSiteBuilder.buildFull(), {
        cloneOnLoad: false
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: true,
        mode: "clone"
      });
    });

    it("should return when editor is connected and in edit mode", async () => {
      const localSiteDir = await initLocalSite(localSiteBuilder.buildFull());

      const server = await localServer.startInEditMode(localSiteDir, {
        token
      });
      await loadEditor(server.port, editorSiteBuilder.buildFull());
      const cli = await connectCli(server.adminPort, adminSocketOptions);

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
      const server = await localServer.startInCloneMode(localSiteDir, {
        token
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      await loadEditor(server.port, editorSiteBuilder.buildFull());

      expect(cloneCompleteSpy).toHaveBeenCalledTimes(1);
    });

    it("should not be sent before cloning started", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir, {
        token
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      await loadEditor(server.port, editorSiteBuilder.buildFull(), {
        cloneOnLoad: false
      });

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });

    it("should not be sent if only the document was cloned", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir, {
        token
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(
        server.port,
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );

      await editor.advanced.saveSiteDocument();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });

    it("should not be sent if only the code files were cloned", async () => {
      const localSiteDir = await initLocalSite();
      const server = await localServer.startInCloneMode(localSiteDir, {
        token
      });
      const cli = await connectCli(server.adminPort, adminSocketOptions);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(
        server.port,
        editorSiteBuilder.buildFull(),
        {
          cloneOnLoad: false
        }
      );

      await editor.advanced.saveCodeFiles();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);
    });
  });
});
