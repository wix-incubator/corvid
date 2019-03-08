const loadEditor = require("@wix/fake-santa-editor");
const startServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");

describe("api", () => {
  describe("clone mode", () => {
    it("should save the editor's document on load", async () => {
      const emptyLocalSite = {};

      const editorSiteDocument = {
        pages: {
          editorPage1: "editor page 1",
          editorPage2: "editor page 2"
        }
      };

      const localSitePath = await initLocalSite(emptyLocalSite);
      const server = await startServer(localSitePath);
      const editor = await loadEditor(server.port, {
        siteDocument: editorSiteDocument
      });

      const localSiteFiles = await readLocalSite(localSitePath);
      expect(localSiteFiles).toEqual({
        public: {
          pages: {
            ["editorPage1.json"]: "editor page 1",
            ["editorPage2.json"]: "editor page 2"
          }
        }
      });

      await editor.close();
      await server.close();
    });
  });
});
