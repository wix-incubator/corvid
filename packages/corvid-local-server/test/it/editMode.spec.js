const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc, initTempDir } = require("corvid-local-test-utils");
const merge_ = require("lodash/merge");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { localSiteDir } = require("corvid-local-test-utils");

afterEach(closeAll);

describe("edit mode", () => {
  it("should not start the server in edit mode for a non corvid project directory", async () => {
    const localPath = await initTempDir({
      src: {
        "something.js": "console.log('something')"
      },
      "package.json": "blah blah blah"
    });

    const server = localServer.startInEditMode(localPath);

    await expect(server).rejects.toThrow("CAN_NOT_EDIT_NON_WIX_SITE");
  });

  it("should not start the server in edit mode if the site directory is empty", async () => {
    const localSitePath = await localSiteDir.initLocalSite({});
    const server = localServer.startInEditMode(localSitePath);
    await expect(server).rejects.toThrow("CAN_NOT_EDIT_EMPTY_SITE");
  });

  it("should load in edit mode when there are no code files", async () => {
    const siteItemsWithoutCode = Object.values(sc.documentCreators).map(
      documentCreator => documentCreator()
    );

    const localSiteFiles = localSiteBuilder.buildPartial(
      ...siteItemsWithoutCode
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    expect(editorSite).toMatchObject(
      editorSiteBuilder.buildPartial(...siteItemsWithoutCode)
    );
  });

  it("should send code files to the editor on load", async () => {
    const siteItems = [
      sc.publicCode(),
      sc.backendCode(),
      sc.collectionSchema()
    ];

    const localSiteFiles = localSiteBuilder.buildFull(...siteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    expect(editorSite).toMatchObject(
      editorSiteBuilder.buildPartial(...siteItems)
    );
  });

  it("should send page code files to the editor on load", async () => {
    const pageWithCode = sc.pageWithCode();

    const localSiteFiles = localSiteBuilder.buildFull(pageWithCode);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const expectedEditorSite = editorSiteBuilder.buildPartial(pageWithCode);
    expect(editorSite).toMatchObject(expectedEditorSite);
  });

  it("should send lightbox code files to the editor on load", async () => {
    const lightBoxWithCode = sc.lightboxWithCode();

    const localSiteFiles = localSiteBuilder.buildFull(lightBoxWithCode);
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const expectedEditorSite = editorSiteBuilder.buildPartial(lightBoxWithCode);

    expect(editorSite).toMatchObject(expectedEditorSite);
  });

  it("should send master page code to the editor on load", async () => {
    const masterPageCode = sc.masterPageCode();

    const localSiteFiles = localSiteBuilder.buildFull(masterPageCode);
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const expectedEditorSite = editorSiteBuilder.buildPartial(masterPageCode);

    expect(editorSite).toMatchObject(expectedEditorSite);
  });

  it("should send site document to the editor on load", async () => {
    const siteItems = sc.fullSiteItems();

    const localSiteFiles = localSiteBuilder.buildPartial(...siteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const editorSite = await editor.getSite();

    const expectedSite = editorSiteBuilder.buildPartial(...siteItems);

    expect(editorSite).toMatchObject(expectedSite);
  });

  it("should send updated site document when user changes page content from the editor and clicks save", async () => {
    const existingSiteItems = [
      sc.page({ pageId: "page1", content: "existing content" }),
      sc.lightbox({
        pageId: "lightbox1",
        content: "existing content"
      })
    ];

    const localSiteFiles = localSiteBuilder.buildFull(...existingSiteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const editorSite = editor.getSite();

    const updatedSiteItems = [
      sc.page({ pageId: "page1", content: "modified content" }),
      sc.lightbox({
        pageId: "lightbox1",
        content: "modified content"
      }),
      sc.page({ pageId: "page2" }) //  new page
    ];

    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);

    await editor.save();

    const localSite = await localSiteDir.readLocalSite(localSitePath);

    const expectedLocalSite = localSiteBuilder.buildPartial(
      ...updatedSiteItems
    );

    expect(localSite).toMatchObject(expectedLocalSite);
  });

  describe("code file updates when editor site is saved", () => {
    it.each(Object.keys(sc.codeCreators))(
      `should update a local [%s] file that was modified in the editor and saved`,
      async itemKey => {
        const originalCodeItem = sc[itemKey]();

        const localSiteFiles = localSiteBuilder.buildFull(originalCodeItem);

        const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(server.port);

        const similarCodeItemWithDifferentContent = sc[itemKey]();
        const newFileContent = localSiteBuilder.getLocalCodeFileContent(
          similarCodeItemWithDifferentContent
        );

        editor.modifyCodeFile(
          editorSiteBuilder.getEditorCodeFilePath(originalCodeItem),
          newFileContent
        );

        await editor.save();

        const localFileContent = await localSiteDir.readFile(
          localSitePath,
          localSiteBuilder.getLocalCodeFilePath(originalCodeItem)
        );
        expect(localFileContent).toEqual(newFileContent);
      }
    );

    it.each(Object.keys(sc.codeCreators))(
      `should delete a local [%s] file that was deleted in the editor and saved`,
      async itemKey => {
        const originalCodeItem = sc[itemKey]();

        const localSiteFiles = localSiteBuilder.buildFull(originalCodeItem);

        const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(server.port);

        editor.deleteCodeFile(
          editorSiteBuilder.getEditorCodeFilePath(originalCodeItem)
        );

        await editor.save();

        const localFileExists = await localSiteDir.doesExist(
          localSitePath,
          localSiteBuilder.getLocalCodeFilePath(originalCodeItem)
        );
        expect(localFileExists).toBe(false);
      }
    );

    it.each(["publicCode", "backendCode", "collectionSchema"])(
      `should copy a local [%s] file that was copied in the editor and saved`,
      async itemKey => {
        const originalCodeItem = sc[itemKey]();

        const localSiteFiles = localSiteBuilder.buildFull(originalCodeItem);

        const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(server.port);

        const similarCodeItemWithDifferentPath = sc[itemKey]();

        editor.copyCodeFile(
          editorSiteBuilder.getEditorCodeFilePath(originalCodeItem),
          editorSiteBuilder.getEditorCodeFilePath(
            similarCodeItemWithDifferentPath
          )
        );

        await editor.save();

        const localFileContent = await localSiteDir.readFile(
          localSitePath,
          localSiteBuilder.getLocalCodeFilePath(
            similarCodeItemWithDifferentPath
          )
        );
        expect(localFileContent).toEqual(
          localSiteBuilder.getLocalCodeFileContent(originalCodeItem)
        );
      }
    );

    it("should not send .metadata.json to the editor on load (WCD-8697)", async () => {
      const siteItems = [
        sc.publicCode(),
        sc.backendCode(),
        sc.collectionSchema()
      ];

      const localSiteFiles = localSiteBuilder.buildFull(...siteItems);

      const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
      const server = await localServer.startInEditMode(localSitePath);
      const editor = await loadEditor(server.port);
      const editorSite = await editor.getSite();
      expect(editorSite).not.toMatchObject({
        siteCode: { ".metadata.json": expect.any(String) }
      });
    });

    it("should send full siteDocument schema even for sections which have no local files", async () => {
      const page = sc.page();

      const localSitePath = await localSiteDir.initLocalSite(
        localSiteBuilder.buildPartial(page)
      );
      const server = await localServer.startInEditMode(localSitePath);

      const editor = await loadEditor(server.port);

      const editorSiteDocument = editor.getSite().siteDocument;
      expect(editorSiteDocument).toMatchObject({
        pages: expect.any(Object),
        routers: {},
        site: {},
        menus: {},
        styles: {},
        documentSchemaVersion: expect.any(String)
      });
    });
  });
});
