const eventually = require("wix-eventually");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const localSiteDir = require("../utils/localSiteDir");
const dirAsJson = require("corvid-dir-as-json");
const merge_ = require("lodash/merge");
const fs = require("fs-extra");
const path = require("path");
const backupsPath = rootPath => path.join(rootPath, ".corvid", "backup");

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
      const backupFolderPath = backupsPath(localSitePath);
      await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
      done();
    }
  });
  it("should not keep a backup for a succesful save", async () => {
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
    const backupFolderPath = backupsPath(localSitePath);
    await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
  });

  it("should restore from backup if backup folder exists on server start in edit mode", async () => {
    const backupFiles = localSiteBuilder.buildFull();
    const localSiteFiles = localSiteBuilder.buildFull();
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    await localSiteDir.initBackup(localSitePath, backupFiles);
    const server = await localServer.startInEditMode(localSitePath);
    await loadEditor(server.port);
    const localSite = await localSiteDir.readLocalSite(localSitePath);
    expect(localSite).toMatchObject(backupFiles);
  });

  it("should delete backup if backup folder exists on server start in clone mode", async () => {
    const backupFiles = localSiteBuilder.buildFull();
    const siteItems = sc.fullSiteItems();
    const editorSite = editorSiteBuilder.buildPartial(...siteItems);
    const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);
    const localSitePath = await localSiteDir.initLocalSite();
    await localSiteDir.initBackup(localSitePath, backupFiles);
    const server = await localServer.startInCloneMode(localSitePath);
    await loadEditor(server.port, editorSite);
    const localSiteFiles = await localSiteDir.readLocalSite(localSitePath);
    expect(localSiteFiles).toMatchObject(expectedLocalSite);
    const backupFolderPath = backupsPath(localSitePath);
    await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
  });

  it("should delete backup if backup folder exists on server start in override clone mode", async () => {
    const backupFiles = localSiteBuilder.buildFull();
    const siteItems = sc.fullSiteItems();
    const editorSite = editorSiteBuilder.buildPartial(...siteItems);
    const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);
    const localSitePath = await localSiteDir.initLocalSite();
    await localSiteDir.initBackup(localSitePath, backupFiles);
    const server = await localServer.startInCloneMode(localSitePath, {
      override: true
    });
    await loadEditor(server.port, editorSite);
    const localSiteFiles = await localSiteDir.readLocalSite(localSitePath);
    expect(localSiteFiles).toMatchObject(expectedLocalSite);
    const backupFolderPath = backupsPath(localSitePath);
    await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
  });

  it("should move backup to snapshots if backup folder exists on server start in move clone mode", async () => {
    const backupFiles = localSiteBuilder.buildFull();
    const siteItems = sc.fullSiteItems();
    const editorSite = editorSiteBuilder.buildPartial(...siteItems);
    const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);
    const localSitePath = await localSiteDir.initLocalSite();
    await localSiteDir.initBackup(localSitePath, backupFiles);
    const server = await localServer.startInCloneMode(localSitePath, {
      move: true
    });
    await loadEditor(server.port, editorSite);
    const localSiteFiles = await localSiteDir.readLocalSite(localSitePath);
    expect(localSiteFiles).toMatchObject(expectedLocalSite);
    const backupFolderPath = backupsPath(localSitePath);
    const snapshotsPath = path.join(localSitePath, ".corvid", "snapshots");
    const snapshotPath = path.join(
      snapshotsPath,
      (await fs.readdir(snapshotsPath))[0]
    );
    const movedSnapshotFiles = await dirAsJson.readDirToJson(snapshotPath);
    expect(movedSnapshotFiles).toEqual(backupFiles);
    await expect(fs.exists(backupFolderPath)).resolves.toBe(false);
  });

  it("should continue watch file changes after successful save", async done => {
    const onCodeChange = jest.fn();
    const onDocumentChange = jest.fn();
    const localSiteFiles = localSiteBuilder.buildFull();

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const unsubscribeFromCodeChange = editor.registerCodeChange(onCodeChange);
    const unsubscribeFromDocumentChange = editor.registerDocumentChange(
      onDocumentChange
    );
    const editorSite = await editor.getSite();
    const updatedSiteItems = [
      sc.page({ pageId: "page1", content: "modified content" })
    ];
    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);

    await editor.save();
    const code = sc.backendCode();
    let filePath = localSiteBuilder.getLocalFilePath(code);
    let fileContent = localSiteBuilder.getLocalFileContent(code);
    localSiteDir.writeFile(localSitePath, filePath, fileContent);
    const watcherPayload = createCodeChangePayload(
      editorSiteBuilder.getEditorCodeFilePath(code),
      fileContent
    );
    const page = sc.page();
    let pageFilePath = localSiteBuilder.getLocalFilePath(page);
    let pageFileContent = localSiteBuilder.getLocalFileContent(page);
    await localSiteDir.writeFile(localSitePath, pageFilePath, pageFileContent);

    await eventually(async () => {
      expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
      expect(onCodeChange).toHaveBeenCalledTimes(1);
      expect(onDocumentChange).toHaveBeenCalledTimes(1);
    });
    unsubscribeFromCodeChange();
    unsubscribeFromDocumentChange();
    done();
  });

  it("should continue watch file changes after failed save", async done => {
    const onCodeChange = jest.fn();
    const onDocumentChange = jest.fn();
    const localSiteFiles = localSiteBuilder.buildFull();

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const unsubscribeFromCodeChange = editor.registerCodeChange(onCodeChange);
    const unsubscribeFromDocumentChange = editor.registerDocumentChange(
      onDocumentChange
    );
    const editorSite = await editor.getSite();
    const illegalPayload = { siteDocument: { pages: null } };
    // it should fail save
    editor.modifyDocument(
      Object.assign(editorSite, illegalPayload).siteDocument
    );
    try {
      await editor.save();
    } catch (e) {
      const code = sc.backendCode();
      let filePath = localSiteBuilder.getLocalFilePath(code);
      let fileContent = localSiteBuilder.getLocalFileContent(code);
      localSiteDir.writeFile(localSitePath, filePath, fileContent);
      const watcherPayload = createCodeChangePayload(
        editorSiteBuilder.getEditorCodeFilePath(code),
        fileContent
      );
      const page = sc.page();
      let pageFilePath = localSiteBuilder.getLocalFilePath(page);
      let pageFileContent = localSiteBuilder.getLocalFileContent(page);
      await localSiteDir.writeFile(
        localSitePath,
        pageFilePath,
        pageFileContent
      );

      await eventually(
        async () => {
          expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
          expect(onDocumentChange).toHaveBeenCalled();
        },
        { timeout: 4000 }
      );
      unsubscribeFromCodeChange();
      unsubscribeFromDocumentChange();
      done();
    }
  });

  it("should create backup folder on save", async () => {
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
    const corvidPath = path.join(localSitePath, ".corvid");
    await fs.ensureDir(corvidPath);
    const watchHandler = jest.fn();
    const watcher = fs.watch(corvidPath, watchHandler);
    await editor.save();
    expect(watchHandler).toHaveBeenCalledWith("rename", "backup");
    watcher.close();
  });
});
