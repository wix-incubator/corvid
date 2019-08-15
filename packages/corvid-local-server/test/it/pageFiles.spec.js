const path = require("path");
const cloneDeep_ = require("lodash/cloneDeep");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: {
    initLocalSite,
    readFile: readSiteFile,
    writeFile: writeSiteFile,
    doesExist: doesSiteFileExist
  }
} = require("corvid-local-test-utils");

afterEach(closeAll);

describe("pageFiles", () => {
  describe("clone mode", () => {
    it("should create an empty local page code file if page with no code is sent on load", async () => {
      const page = sc.page();

      const expectedPageCodePath = localSiteBuilder.getLocalFilePath(
        sc.pageWithCode(page)
      ).code;

      const localSitePath = await initLocalSite();
      const server = await localServer.startInCloneMode(localSitePath);

      const editorSite = editorSiteBuilder.buildFull(page);
      await loadEditor(server.port, editorSite);

      const localPageCode = await readSiteFile(
        localSitePath,
        expectedPageCodePath
      );

      expect(localPageCode).toBe("");
    });

    it("should create an empty local lightbox code file if lightbox with no code is sent on load", async () => {
      const lightbox = sc.lightbox();
      const expectedLightboxCodePath = localSiteBuilder.getLocalFilePath(
        sc.lightboxWithCode(lightbox)
      ).code;

      const localSitePath = await initLocalSite();
      const server = await localServer.startInCloneMode(localSitePath);

      const editorSite = editorSiteBuilder.buildFull(lightbox);
      await loadEditor(server.port, editorSite);

      const localLightboxCode = await readSiteFile(
        localSitePath,
        expectedLightboxCodePath
      );

      expect(localLightboxCode).toBe("");
    });

    it("should create an empty master page code file if it does not exist in the editor", async () => {
      const dummyMasterPageCodeItem = sc.masterPageCode();
      const expectedLocalMasterPageCodePath = localSiteBuilder.getLocalFilePath(
        dummyMasterPageCodeItem
      );

      const siteWithNoMasterPageCode = sc
        .fullSiteItems()
        .filter(item => !sc.isSameCreator(dummyMasterPageCodeItem, item));

      const localSitePath = await initLocalSite();
      const server = await localServer.startInCloneMode(localSitePath);

      const editorSite = editorSiteBuilder.buildPartial(
        ...siteWithNoMasterPageCode
      );
      await loadEditor(server.port, editorSite);

      const localMasterPageCode = await readSiteFile(
        localSitePath,
        expectedLocalMasterPageCodePath
      );

      expect(localMasterPageCode).toBe("");
    });
  });

  describe("edit mode", () => {
    it.each(["page", "lightbox"])(
      "should rename a %s code file when the %s title is changed",
      async pageOrLightbox => {
        const itemWithOldTitle =
          pageOrLightbox === "page"
            ? sc.pageWithCode({ title: "old title" })
            : sc.lightboxWithCode({ title: "old title" });

        const itemWithNewTitle = cloneDeep_(itemWithOldTitle);
        itemWithOldTitle[pageOrLightbox].title = "new title";

        const oldLocalCodePath = localSiteBuilder.getLocalFilePath(
          itemWithOldTitle
        ).code;
        const newLocalCodePath = localSiteBuilder.getLocalFilePath(
          itemWithNewTitle
        ).code;

        const basicSite = sc.fullSiteItems();

        const editorSiteWithOldTitle = editorSiteBuilder.buildPartial(
          ...basicSite,
          itemWithOldTitle
        );
        const editorSiteWithNewTitle = editorSiteBuilder.buildPartial(
          ...basicSite,
          itemWithNewTitle
        );

        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);

        const editor = await loadEditor(server.port, editorSiteWithOldTitle);
        editor.modifyDocument(editorSiteWithNewTitle.siteDocument);
        await editor.save();

        expect(await doesSiteFileExist(localSitePath, oldLocalCodePath)).toBe(
          false
        );

        expect(await readSiteFile(localSitePath, newLocalCodePath)).toBe(
          itemWithOldTitle.code
        );
      }
    );

    it.each([["page", "lightbox"], ["lightbox", "page"]])(
      "should move a %s code file when it is turned into a %s",
      async pageOrLightbox => {
        const dummyCode = "console.log('my code')";

        const pageWithCode = sc.pageWithCode(
          {
            pageId: "testPageId",
            title: "test title"
          },
          dummyCode
        );
        const lightboxWithCode = sc.lightboxWithCode(
          {
            pageId: "testPageId",
            title: "test title"
          },
          dummyCode
        );

        const [fromItem, toItem] =
          pageOrLightbox === "page"
            ? [pageWithCode, lightboxWithCode]
            : [lightboxWithCode, pageWithCode];

        const editorSiteWithItemAndCode = editorSiteBuilder.buildFull(fromItem);

        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);

        const editor = await loadEditor(server.port, editorSiteWithItemAndCode);
        editor.togglePageLightbox("testPageId");
        await editor.save();

        const fromLocalPath = localSiteBuilder.getLocalFilePath(fromItem).code;
        const toLocalPath = localSiteBuilder.getLocalFilePath(toItem).code;

        expect(await doesSiteFileExist(localSitePath, fromLocalPath)).toBe(
          false
        );
        expect(await readSiteFile(localSitePath, toLocalPath)).toEqual(
          dummyCode
        );
      }
    );

    it.each(["page", "lightbox"])(
      "should remove a folder when its related %s is removed",
      async pageOrLightbox => {
        const itemWithCode =
          pageOrLightbox === "page"
            ? sc.pageWithCode({ pageId: "testPageId" })
            : sc.lightboxWithCode({ pageId: "testPageId" });

        const localPageSubFolder = localSiteBuilder.getLocalPageRootPath(
          itemWithCode
        );

        const editorSiteWithItemAndCode = editorSiteBuilder.buildFull(
          itemWithCode
        );

        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);

        const editor = await loadEditor(server.port, editorSiteWithItemAndCode);
        editor.deletePage("testPageId");
        await editor.save();

        expect(await doesSiteFileExist(localSitePath, localPageSubFolder)).toBe(
          false
        );
      }
    );

    it.each(["page", "lightbox"])(
      "should not remove a folder when its related %s is removed if it contains unrecognized user files",
      async pageOrLightbox => {
        const itemWithCode =
          pageOrLightbox === "page"
            ? sc.pageWithCode({ pageId: "testPageId" })
            : sc.lightboxWithCode({ pageId: "testPageId" });

        const localPageSubFolder = localSiteBuilder.getLocalPageRootPath(
          itemWithCode
        );

        const editorSiteWithItemAndCode = editorSiteBuilder.buildFull(
          itemWithCode
        );

        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);

        const pathForUnrecognizedUserFileInsidePageSubFolder = path.join(
          localPageSubFolder,
          "some-user-file.js"
        );

        await writeSiteFile(
          localSitePath,
          pathForUnrecognizedUserFileInsidePageSubFolder,
          "user content"
        );

        const editor = await loadEditor(server.port, editorSiteWithItemAndCode);
        editor.deletePage("testPageId");
        await editor.save();

        expect(
          await readSiteFile(
            localSitePath,
            pathForUnrecognizedUserFileInsidePageSubFolder
          )
        ).toBe("user content");
      }
    );
  });
});
