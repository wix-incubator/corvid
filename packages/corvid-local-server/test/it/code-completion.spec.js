const get_ = require("lodash/get");
const flatten = require("flat");
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
  describe("user installed corvid-types", () => {
    describe("tsconfig file", () => {
      describe("perform clone command", () => {
        it("should add tsconfig file to the backend root folder", async () => {
          const editorSite = editorSiteBuilder.buildFull();
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
          const editorSite = editorSiteBuilder.buildFull();
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
          const editorSite = editorSiteBuilder.buildFull();
          const localSitePath = await initLocalSite();
          const server = await localServer.startInCloneMode(localSitePath);
          await loadEditor(server.port, editorSite);

          expect(
            await readFile(
              localSitePath,
              `pages/site/${localSiteBuilder.TS_CONFIG_NAME}`
            )
          ).toEqual(localSiteBuilder.TS_CONFIG_PAGE_CONTENT);
        });
        it.each(["pages", "lightboxes"])(
          "should add tsconfig file to every page folders",
          async folder => {
            const editorSite = editorSiteBuilder.buildFull();
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
      });
      describe("perform edit command", () => {
        it("should not send to the editor tsconfig files", async () => {
          const localSiteFiles = localSiteBuilder.buildFull();
          const localSitePath = await initLocalSite(localSiteFiles);
          const server = await localServer.startInEditMode(localSitePath);
          const editor = await loadEditor(server.port);

          const { siteCode } = editor.getSite();
          const siteCodeFlatMap = flatten(siteCode, { delimiter: "/" });
          const tsConfigs = Object.keys(siteCodeFlatMap).filter(path =>
            path.endsWith(localSiteBuilder.TS_CONFIG_NAME)
          );
          expect(tsConfigs.length).toEqual(0);
        });
        describe("page deleted from the editor and local saved", () => {
          it.each(["page", "lightbox"])(
            "should delete %s tsconfig file",
            async pageOrLightbox => {
              const item = sc[pageOrLightbox]({ pageId: "testPageId" });
              const localSiteFiles = localSiteBuilder.buildFull(item);
              const localSitePath = await initLocalSite(localSiteFiles);
              const server = await localServer.startInEditMode(localSitePath);
              const editor = await loadEditor(server.port);

              editor.deletePage("testPageId");
              await editor.save();

              expect(
                await doesExist(
                  localSitePath,
                  localSiteBuilder.getLocalFilePath(item, "tsConfig")
                )
              ).toEqual(false);
            }
          );
        });
        describe("page renamed from the editor and local saved", () => {
          it.each(["page", "lightbox"])(
            "should move the tsconfig file to the new root %s folder",
            async pageOrLightbox => {
              const itemWithOldTitle = sc[pageOrLightbox]({
                title: "old title"
              });
              const editorSiteWithOldTitle = editorSiteBuilder.buildFull(
                itemWithOldTitle
              );
              const localSitePath = await initLocalSite(editorSiteWithOldTitle);
              const server = await localServer.startInEditMode(localSitePath);
              const editor = await loadEditor(server.port);

              const itemWithNewTitle = cloneDeep_(itemWithOldTitle);
              itemWithOldTitle.title = "new title";
              const editorSiteWithNewTitle = editorSiteBuilder.buildFull(
                itemWithNewTitle
              );
              editor.modifyDocument(editorSiteWithNewTitle.siteDocument);
              await editor.save();

              const oldLocalTsConfigPath = localSiteBuilder.getLocalFilePath(
                itemWithOldTitle,
                "tsConfig"
              );
              const newLocalTsConfigPath = localSiteBuilder.getLocalFilePath(
                itemWithNewTitle,
                "tsConfig"
              );
              expect(
                await doesExist(localSitePath, oldLocalTsConfigPath)
              ).toEqual(false);

              expect(
                await readFile(localSitePath, newLocalTsConfigPath)
              ).toEqual(localSiteBuilder.TS_CONFIG_PAGE_CONTENT);
            }
          );
        });
        describe("page created from the editor and local saved", () => {
          it.each(["page", "lightbox"])(
            "should add a tsconfig file to the new root %s folder",
            async pageOrLightbox => {
              const item = sc[pageOrLightbox]();
              const editorSiteWitoutItem = editorSiteBuilder.buildFull();
              const localSitePath = await initLocalSite(editorSiteWitoutItem);
              const server = await localServer.startInEditMode(localSitePath);
              const editor = await loadEditor(server.port);

              const editorSiteWithNewItem = editorSiteBuilder.buildFull(item);
              editor.modifyDocument(editorSiteWithNewItem.siteDocument);
              await editor.save();

              const newLocalTsConfigPath = localSiteBuilder.getLocalFilePath(
                item,
                "tsConfig"
              );
              expect(
                await readFile(localSitePath, newLocalTsConfigPath)
              ).toEqual(localSiteBuilder.TS_CONFIG_PAGE_CONTENT);
            }
          );
        });
      });
    });
    describe("typings file", () => {
      describe("perform clone command", () => {
        it("should add typings file to site folder", async () => {
          const commonComponents = sc.commonComponents();
          const editorSite = editorSiteBuilder.buildPartial(commonComponents);
          const localSitePath = await initLocalSite();
          const server = await localServer.startInCloneMode(localSitePath);
          await loadEditor(server.port, editorSite);

          const commonComponentsTypingsPath = localSiteBuilder.getLocalFilePath(
            commonComponents,
            "typings"
          );
          const expectedTypingsContent = localSiteBuilder.getLocalFileContent(
            commonComponents,
            "typings"
          );
          expect(
            await readFile(localSitePath, commonComponentsTypingsPath)
          ).toEqual(expectedTypingsContent);
        });
        it.each(["page", "lightbox"])(
          "should add typings file to %s folder",
          async pageOrLightbox => {
            const item = sc[pageOrLightbox]();
            const editorSite = editorSiteBuilder.buildPartial(item);
            const localSitePath = await initLocalSite();
            const server = await localServer.startInCloneMode(localSitePath);
            await loadEditor(server.port, editorSite);

            const itemTypingsPath = localSiteBuilder.getLocalFilePath(
              item,
              "typings"
            );
            const expectedTypingsContent = localSiteBuilder.getLocalFileContent(
              item,
              "typings"
            );
            expect(await readFile(localSitePath, itemTypingsPath)).toEqual(
              expectedTypingsContent
            );
          }
        );
      });
      describe("perform edit command", () => {
        it("should not send to the editor typings files", async () => {
          const localSiteFiles = localSiteBuilder.buildFull();
          const localSitePath = await initLocalSite(localSiteFiles);
          const server = await localServer.startInEditMode(localSitePath);
          const editor = await loadEditor(server.port);

          const { siteCode } = editor.getSite();
          const siteCodeFlatMap = flatten(siteCode, { delimiter: "/" });
          const typingsFiles = Object.keys(siteCodeFlatMap).filter(path =>
            path.endsWith(localSiteBuilder.D_TS_NAME)
          );
          expect(typingsFiles.length).toEqual(0);
        });
        describe("page deleted from the editor and local saved", () => {
          it.each(["page", "lightbox"])(
            "should delete %s typings file",
            async pageOrLightbox => {
              const item = sc[pageOrLightbox]({ pageId: "testPageId" });
              const localSiteFiles = localSiteBuilder.buildFull(item);
              const localSitePath = await initLocalSite(localSiteFiles);
              const server = await localServer.startInEditMode(localSitePath);
              const editor = await loadEditor(server.port);

              editor.deletePage("testPageId");
              await editor.save();

              expect(
                await doesExist(
                  localSitePath,
                  localSiteBuilder.getLocalFilePath(item, "typings")
                )
              ).toEqual(false);
            }
          );
        });
        describe("page renamed from the editor and local saved", () => {
          it.each(["page", "lightbox"])(
            "should move typings file to the new root %s folder",
            async pageOrLightbox => {
              const itemWithOldTitle = sc[pageOrLightbox]({
                title: "old title"
              });
              const editorSiteWithOldTitle = editorSiteBuilder.buildFull(
                itemWithOldTitle
              );
              const localSitePath = await initLocalSite(editorSiteWithOldTitle);
              const server = await localServer.startInEditMode(localSitePath);
              const editor = await loadEditor(server.port);

              const itemWithNewTitle = cloneDeep_(itemWithOldTitle);
              itemWithOldTitle.title = "new title";
              const editorSiteWithNewTitle = editorSiteBuilder.buildFull(
                itemWithNewTitle
              );
              editor.modifyDocument(editorSiteWithNewTitle.siteDocument);
              await editor.save();

              const newLocalTypingsPath = localSiteBuilder.getLocalFilePath(
                itemWithNewTitle,
                "typings"
              );
              const oldLocalTypingsPath = localSiteBuilder.getLocalFilePath(
                itemWithOldTitle,
                "typings"
              );
              const oldLocalTypingsContent = localSiteBuilder.getLocalFileContent(
                itemWithOldTitle,
                "typings"
              );
              expect(
                await doesExist(localSitePath, oldLocalTypingsPath)
              ).toEqual(false);

              expect(
                await readFile(localSitePath, newLocalTypingsPath)
              ).toEqual(oldLocalTypingsContent);
            }
          );
        });
        describe("page created from the editor and local saved", () => {
          it.each(["page", "lightbox"])(
            "should add typings file to the new root %s folder",
            async pageOrLightbox => {
              const item = sc[pageOrLightbox]();
              const editorSiteWitoutItem = editorSiteBuilder.buildFull();
              const editorSiteWithNewItem = editorSiteBuilder.buildFull(item);
              const localSitePath = await initLocalSite(editorSiteWitoutItem);
              const server = await localServer.startInEditMode(localSitePath);
              const editor = await loadEditor(server.port);

              editor.modifyDocument(editorSiteWithNewItem.siteDocument);
              await editor.save();

              const newLocalTypingsPath = localSiteBuilder.getLocalFilePath(
                item,
                "typings"
              );
              const expectedTypingsContent = localSiteBuilder.getLocalFileContent(
                item,
                "typings"
              );
              expect(
                await readFile(localSitePath, newLocalTypingsPath)
              ).toEqual(expectedTypingsContent);
            }
          );
        });
      });
    });
  });
});
