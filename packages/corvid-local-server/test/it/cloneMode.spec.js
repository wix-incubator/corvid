const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc, initTempDir } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite, readLocalSite, doesExist: doesLocalFileExist }
} = require("corvid-local-testkit");

afterEach(closeAll);

describe("clone mode", () => {
  it("should not start the server in clone mode for a non corvid project directory", async () => {
    const localPath = await initTempDir({
      src: {
        "something.js": "console.log('something')"
      },
      "package.json": "blah blah blah"
    });

    const server = localServer.startInCloneMode(localPath);

    await expect(server).rejects.toThrow("CAN_NOT_CLONE_NON_WIX_SITE");
  });

  it("should not start the server in clone mode for a non empty site", async () => {
    const localSiteFiles = localSiteBuilder.buildPartial(sc.publicCode());
    const localSitePath = await initLocalSite(localSiteFiles);
    const server = localServer.startInCloneMode(localSitePath);
    await expect(server).rejects.toThrow("CAN_NOT_PULL_NON_EMPTY_SITE");
  });

  it("should start if the src directory is empty", async () => {
    const localSitePath = await initLocalSite({});

    const server = localServer.startInCloneMode(localSitePath);

    await expect(server).resolves.toMatchObject({
      port: expect.any(Number),
      adminPort: expect.any(Number),
      close: expect.any(Function)
    });
  });

  // TODO: should not start the server in clone mode if the site directory does not exist ?
  it("should save localy the editor's document on load", async () => {
    const siteItems = sc.fullSiteItems();

    const editorSite = editorSiteBuilder.buildPartial(...siteItems);
    const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);

    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);
    await loadEditor(server.port, editorSite);
    const localSiteFiles = await readLocalSite(localSitePath);

    // todo:: change localSiteBuilder to add empty code page by default (when page cerator is called)
    expect(localSiteFiles).toMatchObject(expectedLocalSite);
  });

  it("should save code files on load", async () => {
    const siteItems = [
      sc.publicCode(),
      sc.backendCode(),
      sc.collectionSchema()
    ];

    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(...siteItems);

    const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should save page code files localy on load", async () => {
    const pageWithCode = sc.pageWithCode();

    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(pageWithCode);
    const expectedLocalSite = localSiteBuilder.buildPartial(pageWithCode);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should save lightbox code files localy on load", async () => {
    const lightboxWithCode = sc.lightboxWithCode();

    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(lightboxWithCode);
    const expectedLocalSite = localSiteBuilder.buildPartial(lightboxWithCode);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should save master page code locally on load", async () => {
    const masterPageCode = sc.masterPageCode();

    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(masterPageCode);
    const expectedLocalSite = localSiteBuilder.buildPartial(masterPageCode);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it.each(["backend", "public", "database"])(
    "should create empty [%s] folder locally even if the site has no files for it",
    async localFolderName => {
      const pageWithCode = sc.pageWithCode();

      const localSitePath = await initLocalSite();
      const server = await localServer.startInCloneMode(localSitePath);

      const editorSite = editorSiteBuilder.buildPartial(pageWithCode);

      await loadEditor(server.port, editorSite);

      const isBackendFolderExsist = await doesLocalFileExist(
        localSitePath,
        localFolderName
      );
      expect(isBackendFolderExsist).toBe(true);
    }
  );
});
