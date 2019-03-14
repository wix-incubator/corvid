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
        page1ID: { content: "" }
      },
      styles: {
        colors: { content: "" },
        fonts: { content: "" },
        theme: { content: "" },
        topLevelStyles: { content: "" }
      },
      site: {
        commonComponents: { content: "" }
      },
      extraData: { content: "" }
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
          ["page1ID.json"]: JSON.stringify({ content: "" }, null, 2)
        },
        styles: {
          ["colors.json"]: JSON.stringify({ content: "" }, null, 2),
          ["fonts.json"]: JSON.stringify({ content: "" }, null, 2),
          ["theme.json"]: JSON.stringify({ content: "" }, null, 2),
          ["topLevelStyles.json"]: JSON.stringify({ content: "" }, null, 2)
        },
        site: {
          ["commonComponents.json"]: JSON.stringify({ content: "" }, null, 2)
        },
        "extraData.json": JSON.stringify({ content: "" }, null, 2)
      }
    });

    await editor.close();
    await server.close();
  });

  it("should save code files on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);
    const siteDocument = {
      pages: {
        editorPage1: { content: "editor page 1" },
        editorPage2: { content: "editor page 2" }
      }
    };
    const siteCode = {
      public: {
        "public-file.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "backend code"
        }
      }
    };
    const editor = await loadEditor(server.port, { siteDocument, siteCode });
    const serverFiles = await readLocalSite(localSitePath);
    expect(serverFiles).toEqual({
      public: {
        pages: {
          ["editorPage1.json"]: JSON.stringify(
            { content: "editor page 1" },
            null,
            2
          ),
          ["editorPage2.json"]: JSON.stringify(
            { content: "editor page 2" },
            null,
            2
          )
        },
        "public-file.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "backend code"
        }
      }
    });

    await editor.close();
    await server.close();
  });
});
