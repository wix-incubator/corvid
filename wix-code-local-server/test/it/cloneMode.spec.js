const {
  editor: loadEditor,
  siteCreators: sc
} = require("@wix/fake-local-mode-editor");
const localServer = require("../../src/server");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");
const { localSiteCreators: lsc } = require("@wix/wix-code-local-site/testkit");

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
      page: { pageId: "page1" },
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
      router: { prefix: "router-prefix" }
    };

    const editorSite = sc.createFull(
      ...Object.keys(siteParts).map(key => sc[key](siteParts[key]))
    );

    const expectedLocalSite = lsc.createFull(
      ...Object.keys(siteParts).map(key => lsc[key](siteParts[key]))
    );

    const localSitePath = await initLocalSite(emptyLocalSite);
    const server = await localServer.startInCloneMode(localSitePath);
    const editor = await loadEditor(server.port, editorSite);
    const localSiteFiles = await readLocalSite(localSitePath);

    expect(localSiteFiles).toEqual(expectedLocalSite);

    await editor.close();
    await server.close();
  });

  it("should save code files on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = sc.createFull(
      sc.publicCode("public-file.json", "public code"),
      sc.backendCode("sub-folder/backendFile.jsw", "backend code")
    );

    const editor = await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    const expectedLocalSite = sc.createPartial(
      lsc.publicCode("public-file.json", "public code"),
      lsc.backendCode("sub-folder/backendFile.jsw", "backend code")
    );
    expect(serverFiles).toMatchObject(expectedLocalSite);

    await editor.close();
    await server.close();
  });
  it("should save page code files localy on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = sc.createFull(
      sc.page({ pageId: "page-1" }),
      sc.pageCode("page-1", "public code")
    );

    const editor = await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    const expectedLocalSite = lsc.createPartial(
      lsc.pageWithCode({ pageId: "page-1" }, "public code")
    );

    expect(serverFiles).toMatchObject(expectedLocalSite);

    await editor.close();
    await server.close();
  });

  it("should save lightbox code files localy on load", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = sc.createFull(
      sc.lightbox({ pageId: "lightbox-1" }),
      sc.lightboxCode("lightbox-1", "lightbox code")
    );

    const editor = await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    const expectedLocalSite = lsc.createPartial(
      lsc.lightboxWithCode({ pageId: "lightbox-1" }, "lightbox code")
    );

    expect(serverFiles).toMatchObject(expectedLocalSite);

    await editor.close();
    await server.close();
  });
});
