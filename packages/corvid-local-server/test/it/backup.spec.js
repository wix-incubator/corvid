const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const localSiteDir = require("../utils/localSiteDir");
const merge_ = require("lodash/merge");
const fs = require("fs-extra");
const path = require("path");

afterEach(closeAll);

describe("Backup", () => {
  it("should restore from backup if updating site document is failed", async done => {
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
    const updatedSiteItems = [
      sc.page({ pageId: "page1", content: "modified content" }),
      sc.lightbox({
        pageId: "lightbox1",
        content: "modified content"
      }),
      sc.page({ pageId: "page2" }) //  new page
    ];

    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(
      merge_({ siteDocument: { shouldFail: true } }, editorSite, siteUpdates)
        .siteDocument
    );
    const prevLocalSite = await localSiteDir.readLocalSite(localSitePath);
    try {
      await editor.save();
    } catch (e) {
      const localSite = await localSiteDir.readLocalSite(localSitePath);
      expect(localSite).toMatchObject(prevLocalSite);
      done();
    }
  });
  it("should delete backup after updating site document", async done => {
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
    const backupFolderPath = path.join(localSitePath, ".corvid/backup");
    await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
    done();
  });
  //   it("should restore from backup if server restarted after exiting in middle of updating site document", () => {});
});
