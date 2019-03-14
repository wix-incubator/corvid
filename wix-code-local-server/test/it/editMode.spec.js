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
  it("should send code files to the editor on load", async () => {
    const localSiteFiles = {
      public: {
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

  it("should send site document to the editor on load", async () => {
    const localSiteFiles = {
      public: {
        pages: {
          "page1ID.json": JSON.stringify({ content: "" }, null, 2),
          "page2ID.json": JSON.stringify({ content: "" }, null, 2)
        },
        styles: {
          "colors.json": JSON.stringify({ content: "" }, null, 2),
          "fonts.json": JSON.stringify({ content: "" }, null, 2),
          "theme.json": JSON.stringify({ content: "" }, null, 2),
          "topLevelStyles.json": JSON.stringify({ content: "" }, null, 2)
        },
        site: {
          "commonComponents.json": JSON.stringify({ content: "" }, null, 2)
        }
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const siteDocument = await editor.getSiteDocument();

    expect(siteDocument).toEqual({
      pages: {
        page1ID: { content: "" },
        page2ID: { content: "" }
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
    });

    await editor.close();
    await server.close();
  });

  it("should send updated site document when user changes page content from the editor and clicks save", async () => {
    const localSiteFiles = {
      public: {
        pages: {
          "page1ID.json": JSON.stringify({ content: "" }, null, 2)
        },
        styles: {
          "colors.json": JSON.stringify({ content: "" }, null, 2),
          "fonts.json": JSON.stringify({ content: "" }, null, 2),
          "theme.json": JSON.stringify({ content: "" }, null, 2),
          "topLevelStyles.json": JSON.stringify({ content: "" }, null, 2)
        },
        site: {
          "commonComponents.json": JSON.stringify({ content: "" }, null, 2)
        },
        lightboxes: {
          "lightBoxes1ID.json": JSON.stringify(
            { isPopUp: true, content: "" },
            null,
            2
          )
        },
        extraData: JSON.stringify({ content: "" }, null, 2)
      }
    };

    const localSitePath = await initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const newDocument = editor.getSiteDocument();
    newDocument.pages["page1ID"]["content"] = "new content";
    newDocument.pages["page2ID"] = {
      content: "this is the new page"
    };
    newDocument.pages["lightBoxes1ID"]["content"] = "this is a new content";
    editor.modifyDocument(newDocument);

    await editor.save();

    const localSiteDocument = await readLocalSite(localSitePath);
    expect(localSiteDocument).toEqual({
      public: {
        pages: {
          "page1ID.json": JSON.stringify({ content: "new content" }, null, 2),
          "page2ID.json": JSON.stringify(
            { content: "this is the new page" },
            null,
            2
          )
        },
        styles: {
          "colors.json": JSON.stringify({ content: "" }, null, 2),
          "fonts.json": JSON.stringify({ content: "" }, null, 2),
          "theme.json": JSON.stringify({ content: "" }, null, 2),
          "topLevelStyles.json": JSON.stringify({ content: "" }, null, 2)
        },
        site: {
          "commonComponents.json": JSON.stringify({ content: "" }, null, 2)
        },
        lightboxes: {
          "lightBoxes1ID.json": JSON.stringify(
            { isPopUp: true, content: "this is a new content" },
            null,
            2
          )
        },
        extraData: JSON.stringify({ content: "" }, null, 2)
      }
    });

    await editor.close();
    await server.close();
  });
});