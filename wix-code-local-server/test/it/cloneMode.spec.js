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
        }
      }
    });

    await editor.close();
    await server.close();
  });

  it("should save code files", async () => {
    const emptyLocalSite = {};

    const editorSiteDocument = {
      pages: {
        editorPage1: { content: "editor page 1" },
        editorPage2: { content: "editor page 2" }
      }
    };

    const localSitePath = await initLocalSite(emptyLocalSite);
    const server = await localServer.startInCloneMode(localSitePath);
    const editor = await loadEditor(server.port, {
      siteDocument: editorSiteDocument
    });

    await editor.updateCode({
      modifiedFiles: {
        "backend/authorization-config.json":
          'console.log("authorization-config")',
        "backend/routers.json": 'console.log("routers")',
        "public/public-code-file-1.js": 'console.log("public-code-file-1")',
        "public/public-code-file-2.js": 'console.log("public-code-file-2")'
      },
      copiedFiles: [],
      deletedFiles: []
    });

    const localSiteFiles = await readLocalSite(localSitePath);
    // TODO: toMatchObject instead of toEqual
    expect(localSiteFiles).toEqual({
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
        "public-code-file-1.js": 'console.log("public-code-file-1")',
        "public-code-file-2.js": 'console.log("public-code-file-2")'
      },
      backend: {
        "authorization-config.json": 'console.log("authorization-config")',
        "routers.json": 'console.log("routers")'
      }
    });

    await editor.close();
    await server.close();
  });
});
