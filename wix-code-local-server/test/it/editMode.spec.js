const loadEditor = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite } = require("../utils/localSiteDir");

describe("edit mode", () => {
  it("should not start the server in edit mode if the site directory is empty", async () => {
    const localSiteFiles = {};

    const localSitePath = await initLocalSite(localSiteFiles);

    const server = localServer.startInEditMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_EDIT_EMPTY_SITE");
  });
  it("should send code files to the editor", async () => {
    const localSiteFiles = {
      public: {
        pages: {
          page1ID: ""
        },
        "public-file.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "bakend code"
        }
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const codeFiles = await editor.getCodeFiles();
    expect(codeFiles).toEqual({
      public: {
        "public-file.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "bakend code"
        }
      }
    });

    await editor.close();
    await server.close();
  });

  it("should send site document to the editor", async () => {
    const localSiteFiles = {
      public: {
        pages: {
          "page1ID.json": ""
        }
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const siteDocument = await editor.getSiteDocument();
    expect(siteDocument).toEqual(localSiteFiles);

    await editor.close();
    await server.close();
  });
});
