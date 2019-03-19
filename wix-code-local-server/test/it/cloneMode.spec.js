const loadEditor = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");
const lsc = require("../utils/localSiteCreators");
const dc = require("../utils/documentCreators");

describe("clone mode", () => {
  it("should not start the server in clone mode if the site directory is not empty", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.code("public/file.js", "some code")
    );

    const localSitePath = await initLocalSite(localSiteFiles);

    const server = localServer.startInCloneMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_CLONE_NON_EMPTY_SITE");
  });

  // TODO: should not start the server in clone mode if the site directory does not exist ?

  it("should save the editor's document on load", async () => {
    const emptyLocalSite = {};
    const siteParts = {
      page: "page-1",
      colors: "colors-content",
      fonts: "fonts-content",
      theme: "theme-content",
      topLevelStyles: "topLevelStyles-content",
      commonComponents: "commonComponents-content",
      menu: "menu-content",
      multilingualInfo: "multilingualInfo-content",
      siteInfo: "siteInfo-content",
      metadata: "metadata-content",
      extraData: {
        version: "version-content",
        seoStuff: "seoStuff-content"
      }
    };

    // todo:: convert to a function for both creators
    const editorSiteDocument = dc.createFull(
      ...Object.keys(siteParts).map(key => dc[key](siteParts[key]))
    );

    const localSitePath = await initLocalSite(emptyLocalSite);
    const server = await localServer.startInCloneMode(localSitePath);
    const editor = await loadEditor(server.port, {
      siteDocument: editorSiteDocument
    });
    const localSiteFiles = await readLocalSite(localSitePath);

    const expectedLocalSiteFiles = lsc.createFull(
      ...Object.keys(siteParts).map(key => lsc[key](siteParts[key]))
    );

    expect(localSiteFiles).toEqual(expectedLocalSiteFiles);

    await editor.close();
    await server.close();
  });

  it("should save code files on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);
    const page1 = "editorPage1";
    const page2 = "editorPage2";
    const code1 = {
      path: "public/public-file.json",
      content: "public code"
    };
    const code2 = {
      path: "backend/sub-folder/backendFile.jsw",
      content: "backend code"
    };
    const siteDocument = dc.createFull(dc.page(page1), dc.page(page2));

    // code creator
    const siteCode = lsc.createPartial(
      lsc.code(code1.path, code1.content),
      lsc.code(code2.path, code2.content)
    );

    const editor = await loadEditor(server.port, { siteDocument, siteCode });
    const serverFiles = await readLocalSite(localSitePath);

    const expected = lsc.createPartial(
      lsc.code(code1.path, code1.content),
      lsc.code(code2.path, code2.content)
    );
    expect(serverFiles).toMatchObject(expected);

    await editor.close();
    await server.close();
  });
});
