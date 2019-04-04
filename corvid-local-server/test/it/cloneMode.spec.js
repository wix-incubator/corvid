const get_ = require("lodash/get");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  initLocalSite,
  initLocalSiteWithConfig,
  readLocalSite,
  isFolderExsist
} = require("../utils/localSiteDir");

const getConfig = expectedLocalSite => ({
  ".corvidrc.json": expectedLocalSite[".corvidrc.json"]
});

afterEach(closeAll);

describe("clone mode", () => {
  it("should not start the server in clone mode if no .corvid.json exists in site directory", async () => {
    const localSitePath = await initLocalSite();

    const server = localServer.startInCloneMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_CLONE_NON_WIX_SITE");
  });

  it("should not start the server in clone mode if the site directory is not empty", async () => {
    const localSiteFiles = localSiteBuilder.buildFull(sc.publicCode());

    const localSitePath = await initLocalSite(localSiteFiles);

    const server = localServer.startInCloneMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_PULL_NON_EMPTY_SITE");
  });

  it("should start if the directoy only contains dot (.) files", async () => {
    const localSitePath = await initLocalSite({
      ".logs": {
        "some-log-file.log": "log log log"
      },
      ".corvidrc.json": "rc file"
    });

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

    const localSitePath = await initLocalSiteWithConfig(
      getConfig(expectedLocalSite)
    );
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

    const localSitePath = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(...siteItems);

    const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should save page code files localy on load", async () => {
    const pageWithCode = sc.pageWithCode();

    const localSitePath = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(pageWithCode);
    const expectedLocalSite = localSiteBuilder.buildPartial(pageWithCode);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should save lightbox code files localy on load", async () => {
    const lightboxWithCode = sc.lightboxWithCode();

    const localSitePath = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(lightboxWithCode);
    const expectedLocalSite = localSiteBuilder.buildPartial(lightboxWithCode);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should save master page code locally on load", async () => {
    const masterPageCode = sc.masterPageCode();

    const localSitePath = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(masterPageCode);
    const expectedLocalSite = localSiteBuilder.buildPartial(masterPageCode);

    await loadEditor(server.port, editorSite);
    const serverFiles = await readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expectedLocalSite);
  });

  it("should create empty page code file on local file system if page with no code is sent on load", async () => {
    const page = sc.page();

    const localSitePath = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(page);
    await loadEditor(server.port, editorSite);

    const serverFiles = await readLocalSite(localSitePath);

    const pageCodePath = localSiteBuilder
      .getLocalFilePath(page)
      .replace(".wix", ".js"); // todo:: move to site creator/localSiteBuilder
    const fileContent = get_(serverFiles, pageCodePath.split("/"));

    expect(fileContent).toBe("");
  });

  it("should create empty lightbox code file on local file system if lightbox with no code is sent on load", async () => {
    const lightbox = sc.lightbox();

    const localSitePath = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull(lightbox);
    await loadEditor(server.port, editorSite);

    const serverFiles = await readLocalSite(localSitePath);
    const pageCodePath = localSiteBuilder
      .getLocalFilePath(lightbox)
      .replace(".wix", ".js"); // todo:: move to site creator/localSiteBuilder
    const fileContent = get_(serverFiles, pageCodePath.split("/"));

    expect(fileContent).toBe("");
  });

  it.each(["backend", "public", "database"])(
    "should create empty [%s] folder locally even if the site has no files for it",
    async localFolderName => {
      const pageWithCode = sc.pageWithCode();

      const localSitePath = await initLocalSiteWithConfig();
      const server = await localServer.startInCloneMode(localSitePath);

      const editorSite = editorSiteBuilder.buildPartial(pageWithCode);

      await loadEditor(server.port, editorSite);

      const isBackendFolderExsist = await isFolderExsist(
        localSitePath,
        localFolderName
      );
      expect(isBackendFolderExsist).toBe(true);
    }
  );
});
