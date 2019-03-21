const {
  editor: loadEditor,
  siteCreators: sc
} = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");
const lsc = require("@wix/wix-code-local-site/test/utils/localSiteCreators");

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
      page: "page1",
      colors: "colors-content",
      fonts: "fonts-content",
      theme: "theme-content",
      topLevelStyles: "topLevelStyles-content",
      commonComponents: "commonComponents-content",
      menu: "menu-content",
      multilingualInfo: "multilingualInfo-content",
      siteInfo: "siteInfo-content",
      dataFromMasterPage: "dataFromMasterPage-content",
      version: "version-content",
      revision: "revision-content",
      misc: "misc-content"
    };

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

    const expected = lsc.createPartial(
      lsc.pageWithCode("page-1", null, "public code")
    );

    expect(serverFiles).toMatchObject(expected);

    await editor.close();
    await server.close();
  });

  it("should save lightbox code files localy on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const siteDocument = sc.createFull(sc.lightbox("lightbox-1"));
    const siteCode = sc.createPartial(
      sc.lightboxCode("lightbox-1", "lightbox code")
    );

    const editor = await loadEditor(server.port, { siteDocument, siteCode });
    const serverFiles = await readLocalSite(localSitePath);

    const expected = lsc.createPartial(
      lsc.lightboxWithCode("lightbox-1", null, "lightbox code")
    );

    expect(serverFiles).toMatchObject(expected);

    await editor.close();
    await server.close();
  });
});
