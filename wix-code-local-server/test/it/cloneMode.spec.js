const loadEditor = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");

describe("clone mode", () => {
  it("should not start the server in clone mode if the site directory is not empty", async () => {
    const localSiteFiles = {
      public: {
        "file.js": "some code"
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);

    const server = localServer.startInCloneMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_CLONE_NON_EMPTY_SITE");
  });

  // TODO: should not start the server in clone mode if the site directory does not exist ?

  it("should save the editor's document on load", async () => {
    const emptyLocalSite = {};

    const editorSiteDocument = {
      pages: {
        editorPage1: "editor page 1",
        editorPage2: "editor page 2"
      }
    };

    const localSitePath = await initLocalSite(emptyLocalSite);
    const server = await localServer.startInCloneMode(localSitePath);
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
