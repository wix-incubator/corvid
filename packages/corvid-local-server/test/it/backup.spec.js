const eventually = require("wix-eventually");
const isObject_ = require("lodash/isObject");
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
const backupsPath = ".corvid/backup";

const createCodeChangePayload = (path, content) => ({
  modifiedFiles: [{ path, content }],
  deletedFiles: []
});

afterEach(closeAll);

describe("Backup", () => {
  it("should restore from backup if updating site document is failed", async done => {
    const localSiteFiles = localSiteBuilder.buildFull();

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const illegalPayload = { siteDocument: { pages: null } };
    // it should fail save
    editor.modifyDocument(
      Object.assign(editorSite, illegalPayload).siteDocument
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
    const localSiteFiles = localSiteBuilder.buildFull();

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const updatedSiteItems = [
      sc.page({ pageId: "page1", content: "modified content" })
    ];

    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);

    await editor.save();
    const localSite = await localSiteDir.readLocalSite(localSitePath);
    const expectedLocalSite = localSiteBuilder.buildPartial(
      ...updatedSiteItems
    );
    expect(localSite).toMatchObject(expectedLocalSite);
    const backupFolderPath = path.join(localSitePath, backupsPath);
    await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
    done();
  });

  it("should restore from backup if backup folder exists on server start", async () => {
    const backupFiles = localSiteBuilder.buildFull();
    const localSiteFiles = localSiteBuilder.buildFull();
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    await localSiteDir.initBackup(
      backupFiles,
      path.join(localSitePath, ".corvid", "backup")
    );
    await localServer.startInEditMode(localSitePath);
    const localSite = await localSiteDir.readLocalSite(localSitePath);
    expect(localSite).toMatchObject(backupFiles);
  });

  it("should continue watch file changes", async done => {
    const onCodeChange = jest.fn();
    const localSiteFiles = localSiteBuilder.buildFull();

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const unsubscribeFromCodeChange = editor.registerCodeChange(onCodeChange);
    const editorSite = await editor.getSite();
    const updatedSiteItems = [
      sc.page({ pageId: "page1", content: "modified content" })
    ];
    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);

    await editor.save();
    const code = sc.backendCode();
    let filePath = localSiteBuilder.getLocalFilePath(code);
    filePath = isObject_(filePath) ? filePath.code : filePath;
    let fileContent = localSiteBuilder.getLocalFileContent(code);
    fileContent = isObject_(fileContent) ? fileContent.code : fileContent;
    localSiteDir.writeFile(localSitePath, filePath, fileContent);
    const watcherPayload = createCodeChangePayload(
      editorSiteBuilder.getEditorCodeFilePath(code),
      fileContent
    );

    await eventually(async () => {
      expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
    });
    unsubscribeFromCodeChange();
    done();
  });
});
