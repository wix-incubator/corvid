const {
  editor: loadEditor,
  siteCreators: sc
} = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const connectCli = require("../utils/fakeCli");
const lsc = require("@wix/wix-code-local-site/test/utils/localSiteCreators");
const { initLocalSite } = require("../utils/localSiteDir");

describe("admin api", () => {
  describe("GET_STATUS", () => {
    it("should return when editor is disconnected and in clone mode", async () => {
      const localSiteDir = await initLocalSite();

      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: false,
        mode: "clone"
      });

      await cli.close();
      await server.close();
    });

    it("should return when editor is disconnected and in edit mode", async () => {
      const localSiteDir = await initLocalSite(lsc.createFull());

      const server = await localServer.startInEditMode(localSiteDir);
      const cli = await connectCli(server.adminPort);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: false,
        mode: "edit"
      });

      await cli.close();
      await server.close();
    });

    it("should return when editor is connected and in clone mode", async () => {
      const localSiteDir = await initLocalSite({});

      const server = await localServer.startInCloneMode(localSiteDir);
      const editor = await loadEditor(server.port, sc.createFull(), {
        cloneOnLoad: false
      });
      const cli = await connectCli(server.adminPort);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: true,
        mode: "clone"
      });

      await cli.close();
      await editor.close();
      await server.close();
    });

    it("should return when editor is connected and in edit mode", async () => {
      const localSiteDir = await initLocalSite(lsc.createFull());

      const server = await localServer.startInEditMode(localSiteDir);
      const editor = await loadEditor(server.port, sc.createFull());
      const cli = await connectCli(server.adminPort);

      expect(await cli.getServerStatus()).toEqual({
        editorPort: server.port,
        editorConnected: true,
        mode: "edit"
      });

      await cli.close();
      await editor.close();
      await server.close();
    });
  });

  describe("clone-complete", () => {
    it("should be sent when cloning the site has ended", async () => {
      const localSiteDir = await initLocalSite({});
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(server.port, sc.createFull());

      expect(cloneCompleteSpy).toHaveBeenCalledTimes(1);

      await cli.close();
      await editor.close();
      await server.close();
    });

    it("should not be sent before cloning started", async () => {
      const localSiteDir = await initLocalSite({});
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(server.port, sc.createFull(), {
        cloneOnLoad: false
      });

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);

      await cli.close();
      await editor.close();
      await server.close();
    });

    it("should not be sent if only the document was cloned", async () => {
      const localSiteDir = await initLocalSite({});
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(server.port, sc.createFull(), {
        cloneOnLoad: false
      });

      await editor.advanced.saveSiteDocument();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);

      await cli.close();
      await editor.close();
      await server.close();
    });

    it("should not be sent if only the code files were cloned", async () => {
      const localSiteDir = await initLocalSite({});
      const server = await localServer.startInCloneMode(localSiteDir);
      const cli = await connectCli(server.adminPort);

      const cloneCompleteSpy = jest.fn();
      cli.onServerEvent("clone-complete", cloneCompleteSpy);

      const editor = await loadEditor(server.port, sc.createFull(), {
        cloneOnLoad: false
      });

      await editor.advanced.saveCodeFiles();

      expect(cloneCompleteSpy).not.toHaveBeenCalledTimes(1);

      await cli.close();
      await editor.close();
      await server.close();
    });
  });
});
