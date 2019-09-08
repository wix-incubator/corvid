const get_ = require("lodash/get");
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
  localSiteDir: { initLocalSite, readLocalSite, doesExist, readFile }
} = require("corvid-local-test-utils");

afterEach(closeAll);

describe("Code Completion", () => {
  describe("tsconfig", () => {
    describe("perform clone command", () => {
      it("should add tsconfig file to the backend root folder", async () => {
        const siteItems = sc.fullSiteItems();
        const editorSite = editorSiteBuilder.buildPartial(...siteItems);
        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);
        await loadEditor(server.port, editorSite);
        const localSiteFiles = await readLocalSite(localSitePath);

        const tsConfigContent = get_(localSiteFiles, [
          "backend",
          "tsconfig.json"
        ]);
        expect(tsConfigContent).toEqual(
          localSiteBuilder.TS_CONFIG_BACKEND_CONTENT
        );
      });
      it("should add tsconfig file to the public root folder", async () => {
        const siteItems = sc.fullSiteItems();
        const editorSite = editorSiteBuilder.buildPartial(...siteItems);
        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);
        await loadEditor(server.port, editorSite);
        const localSiteFiles = await readLocalSite(localSitePath);

        const tsConfigContent = get_(localSiteFiles, [
          "public",
          "tsconfig.json"
        ]);
        expect(tsConfigContent).toEqual(
          localSiteBuilder.TS_CONFIG_PUBLIC_CONTENT
        );
      });
      it("should add tsconfig file to site folder", async () => {
        const siteItems = sc.fullSiteItems();
        const editorSite = editorSiteBuilder.buildPartial(...siteItems);
        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);
        await loadEditor(server.port, editorSite);
        const localSiteFiles = await readLocalSite(localSitePath);

        const tsConfigContent = get_(localSiteFiles, [
          "pages",
          "site",
          "tsconfig.json"
        ]);
        expect(tsConfigContent).toEqual(
          localSiteBuilder.TS_CONFIG_PAGE_CONTENT
        );
      });
      it.each(["pages", "lightboxes"])(
        "should add tsconfig file to every page folders",
        async folder => {
          const siteItems = sc.fullSiteItems();
          const editorSite = editorSiteBuilder.buildPartial(...siteItems);
          const localSitePath = await initLocalSite();
          const server = await localServer.startInCloneMode(localSitePath);
          await loadEditor(server.port, editorSite);
          const localSiteFiles = await readLocalSite(localSitePath);
          const items = get_(localSiteFiles, [folder]);
          const localPagesTsConfigs = Object.values(items).map(
            folder => folder["tsconfig.json"]
          );
          const expectedPagesTsConfigs = new Array(
            Object.keys(items).length
          ).fill(localSiteBuilder.TS_CONFIG_PAGE_CONTENT);

          expect(localPagesTsConfigs).toEqual(expectedPagesTsConfigs);
        }
      );
      // todo:: implement
      // describe("local code changes", () => {
      //   it("should not send to the editor backend tsConfig file", () => {});
      //   it("should not send to the editor public tsConfig file", () => {});
      //   it("should not send to the editor site tsConfig file", () => {});
      //   it.each(["page", "lightboxe"])("should not send to the editor %s tsConfig file", async () => {});
      // });
    });
    describe("perform edit command", () => {
      describe("page deleted from the editor and local saved", () => {
        it.each(["page", "lightbox"])(
          "should delete %s tsconfig file",
          async item => {
            const pageOrLightbox = sc[item]({ pageId: "testPageId" });
            const localSiteFiles = localSiteBuilder.buildFull(pageOrLightbox);

            const localSitePath = await initLocalSite(localSiteFiles);
            const server = await localServer.startInEditMode(localSitePath);
            const editor = await loadEditor(server.port);

            editor.deletePage("testPageId");

            await editor.save();

            const localFileExists = await doesExist(
              localSitePath,
              localSiteBuilder.getLocalFilePath(pageOrLightbox, "tsConfig")
            );

            expect(localFileExists).toBe(false);
          }
        );
      });
      describe("page renamed from the editor and local saved", () => {
        it.each(["page", "lightbox"])(
          "should move the tsconfig file to the new root %s folder",
          async pageOrLightbox => {
            const itemWithOldTitle = sc[pageOrLightbox]({
              pageId: "testPageId",
              title: "old title"
            });

            const itemWithNewTitle = cloneDeep_(itemWithOldTitle);
            itemWithOldTitle.title = "new title";

            const oldLocalTsConfigPath = localSiteBuilder.getLocalFilePath(
              itemWithOldTitle,
              "tsConfig"
            );
            const newLocalTsConfigPath = localSiteBuilder.getLocalFilePath(
              itemWithNewTitle,
              "tsConfig"
            );

            const basicSite = sc.fullSiteItems();

            const editorSiteWithOldTitle = editorSiteBuilder.buildPartial(
              ...basicSite,
              itemWithOldTitle
            );
            const editorSiteWithNewTitle = editorSiteBuilder.buildPartial(
              ...basicSite,
              itemWithNewTitle
            );
            const localSitePath = await initLocalSite(editorSiteWithOldTitle);
            const server = await localServer.startInEditMode(localSitePath);
            const editor = await loadEditor(server.port);
            editor.modifyDocument(editorSiteWithNewTitle.siteDocument);
            await editor.save();

            expect(await doesExist(localSitePath, oldLocalTsConfigPath)).toBe(
              false
            );

            expect(await readFile(localSitePath, newLocalTsConfigPath)).toBe(
              localSiteBuilder.TS_CONFIG_PAGE_CONTENT
            );
          }
        );
      });
      describe("page created from the editor and local saved", () => {
        it.each(["page", "lightbox"])(
          "should add a tsconfig file to the new root %s folder",
          async pageOrLightbox => {
            const item = sc[pageOrLightbox]({ pageId: "testPageId" });
            const basicSite = sc.fullSiteItems();

            const editorSiteWitoutItem = editorSiteBuilder.buildPartial(
              ...basicSite
            );
            const editorSiteWithNewItem = editorSiteBuilder.buildPartial(
              ...basicSite,
              item
            );
            const localSitePath = await initLocalSite(editorSiteWitoutItem);
            const server = await localServer.startInEditMode(localSitePath);
            const editor = await loadEditor(server.port);
            editor.modifyDocument(editorSiteWithNewItem.siteDocument);
            await editor.save();

            const newLocalTsConfigPath = localSiteBuilder.getLocalFilePath(
              item,
              "tsConfig"
            );

            expect(await readFile(localSitePath, newLocalTsConfigPath)).toBe(
              localSiteBuilder.TS_CONFIG_PAGE_CONTENT
            );
          }
        );
      });
    });
  });

  // describe("types.d.ts", () => {
  //   describe("perform clone command", () => {
  //     it("should add types.d.ts file to the backend root folder", async () => {});
  //     it("should add types.d.ts file to the public root folder", async () => {});
  //     it("should add types.d.ts file to the site root folder", async () => {});
  //     it.each(["pages", "lightboxes"])(
  //       "should add types.d.ts file to every page folders",
  //       async folder => {}
  //     );
  //   });
  //   describe("perform edit command", () => {
  //     describe("page deleted from the editor and local saved", () => {
  //       it.each(["page", "lightbox"])(
  //         "should delete %s tsconfig file",
  //         async item => {}
  //       );
  //     });
  //     describe("page renamed from the editor and local saved", () => {
  //       it.each(["page", "lightbox"])(
  //         "should move the tsconfig file to the new root %s folder",
  //         async pageOrLightbox => {}
  //       );
  //     });
  //     describe("page created from the editor and local saved", () => {
  //       it.each(["page", "lightbox"])(
  //         "should add a tsconfig file to the new root %s folder",
  //         async pageOrLightbox => {}
  //       );
  //     });
  //   });
  // });
});
