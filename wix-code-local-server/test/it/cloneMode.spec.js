const loadEditor = require("@wix/fake-local-mode-editor/src/editor");
const localServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");
const lsc = require("../utils/localSiteCreators");
const sc = require("../utils/siteCreators");

describe("clone mode", () => {
  it("should not start the server in clone mode if the site directory is not empty", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.publicCode("file.js", "some code")
    );

    const localSitePath = await initLocalSite(localSiteFiles);

    const server = localServer.startInCloneMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_CLONE_NON_EMPTY_SITE");
  });

  // TODO: should not start the server in clone mode if the site directory does not exist ?

  it("should save localy the editor's document on load", async () => {
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
    const editorSiteDocument = sc.createFull(
      ...Object.keys(siteParts).map(key => sc[key](siteParts[key]))
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

    const siteDocument = sc.createFull();
    const siteCode = lsc.createPartial(
      lsc.publicCode("public-file.json", "public code"),
      lsc.backendCode("sub-folder/backendFile.jsw", "backend code")
    );

    const editor = await loadEditor(server.port, { siteDocument, siteCode });
    const serverFiles = await readLocalSite(localSitePath);

    const expected = sc.createPartial(
      sc.publicCode("public-file.json", "public code"),
      sc.backendCode("sub-folder/backendFile.jsw", "backend code")
    );
    expect(serverFiles).toMatchObject(expected);

    await editor.close();
    await server.close();
  });
  it("should save page code files localy on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const siteDocument = sc.createFull(sc.page("page-1"));
    const siteCode = sc.createPartial(sc.pageCode("page-1", "public code"));

    const editor = await loadEditor(server.port, { siteDocument, siteCode });
    const serverFiles = await readLocalSite(localSitePath);

    const expected = lsc.createPartial(lsc.pageCode("page-1", "public code"));

    expect(serverFiles).toMatchObject(expected);

    await editor.close();
    await server.close();
  });
});
