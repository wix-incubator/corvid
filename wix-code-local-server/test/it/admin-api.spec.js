const {
  editor: loadEditor,
  siteCreators: sc
} = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const connectCli = require("../utils/fakeCli");
const lsc = require("@wix/wix-code-local-site/test/utils/localSiteCreators");
const { initLocalSite } = require("../utils/localSiteDir");

describe("admin api", () => {
  describe("GET STATUS", () => {
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
      const editor = await loadEditor(server.port, {
        siteDocument: sc.createFull()
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
      const editor = await loadEditor(server.port, {
        siteDocument: sc.createFull()
      });
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
});
