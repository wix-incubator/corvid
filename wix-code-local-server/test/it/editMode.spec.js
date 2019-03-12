const loadEditor = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");

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
          "backendFile.jsw": "backend code"
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
          "backendFile.jsw": "backend code"
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

  it("should update code files", async () => {
    const localSiteFiles = {
      public: {
        pages: {
          "page1.json": "page code"
        },
        "public-file.json": "public code",
        "public-file1.json": "public code 1"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "backend code"
        }
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    editor.modifyCodeFile(
      "backend/authorization-config.json",
      'console.log("authorization-config")'
    );
    editor.deleteCodeFile("public/public-file1.json");
    editor.copyCodeFile(
      "public/public-file.json",
      "public/public-file-copied.json"
    );
    await editor.save();
    const codeFiles = await editor.getCodeFiles();
    const serverFiles = await readLocalSite(localSitePath);
    expect(serverFiles).toEqual({
      public: {
        pages: {
          "page1.json": "page code"
        },
        "public-file.json": "public code",
        "public-file-copied.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "backend code"
        },
        "authorization-config.json": 'console.log("authorization-config")'
      }
    });
    expect(codeFiles).toEqual({
      public: {
        "public-file.json": "public code",
        "public-file-copied.json": "public code"
      },
      backend: {
        "sub-folder": {
          "backendFile.jsw": "backend code"
        },
        "authorization-config.json": 'console.log("authorization-config")'
      }
    });
    await editor.close();
    await server.close();
  });
});
