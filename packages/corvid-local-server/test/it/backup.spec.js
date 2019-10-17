const eventually = require("wix-eventually");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc, socketClient } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { localSiteDir } = require("corvid-local-test-utils");
const merge_ = require("lodash/merge");
const fs = require("fs-extra");
const path = require("path");
const backupsPath = rootPath => path.join(rootPath, ".corvid", "backup");

const createCodeChangePayload = (path, content) => ({
  modifiedFiles: [{ path, content }],
  deletedFiles: []
});

afterEach(closeAll);

const sendUpdateSiteDocument = async (server, updatedDocument) => {
  const clientSocketOptions = {
    transportOptions: {
      polling: {
        extraHeaders: {
          origin: "https://editor.wix.com"
        }
      }
    }
  };

  const editorSocket = await socketClient.connect(
    `http://localhost:${server.port}`,
    clientSocketOptions
  );

  await socketClient.sendRequest(
    editorSocket,
    "UPDATE_DOCUMENT",
    updatedDocument
  );
};

describe("Backup", () => {
  it("should restore from backup if updating site document is failed", async done => {
    const localSiteFiles = localSiteBuilder.buildFull();
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const prevLocalSite = await localSiteDir.readLocalSite(localSitePath);

    try {
      const invalidSiteDocument = {
        pages: "string which is not pages"
      };
      await sendUpdateSiteDocument(server, invalidSiteDocument);
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
      sc.page({
        pageId: "page1",
        content: sc.generatePageContent("modified content")
      })
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

  it("should fail if backup folder exists", async () => {
    const backupFiles = localSiteBuilder.buildFull();
    const localSiteFiles = localSiteBuilder.buildFull();
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    await localSiteDir.initBackup(localSitePath, backupFiles);
    const server = localServer.startInEditMode(localSitePath);
    await expect(server).rejects.toThrow("BACKUP_FOLDER_EXISTS");
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
      sc.page({
        pageId: "page1",
        content: sc.generatePageContent("modified content")
      })
    ];
    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);

    await editor.save();

    const code = sc.backendCode();
    const filePath = localSiteBuilder.getLocalFilePath(code, "code");
    const fileContent = localSiteBuilder.getLocalFileContent(code, "code");

    localSiteDir.writeFile(localSitePath, filePath, fileContent);
    const watcherPayload = createCodeChangePayload(
      editorSiteBuilder.getEditorCodeFilePath(code),
      fileContent
    );
    const page = sc.page();
    const pageFilePath = localSiteBuilder.getLocalFilePath(page, "page");
    const pageFileContent = localSiteBuilder.getLocalFileContent(page, "page");

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

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("should continue watch file changes after failed save", async done => {
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
      const filePath = localSiteBuilder.getLocalFilePath(code, "code");
      const fileContent = localSiteBuilder.getLocalFileContent(code, "code");

      localSiteDir.writeFile(localSitePath, filePath, fileContent);
      const watcherPayload = createCodeChangePayload(
        editorSiteBuilder.getEditorCodeFilePath(code),
        fileContent
      );
      const page = sc.page();
      const pageFilePath = localSiteBuilder.getLocalFilePath(page, "page");
      const pageFileContent = localSiteBuilder.getLocalFileContent(
        page,
        "page"
      );

      await localSiteDir.writeFile(
        localSitePath,
        pageFilePath,
        pageFileContent
      );

      await eventually(
        async () => {
          expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
          expect(onCodeChange).toHaveBeenCalledTimes(1);
          expect(onDocumentChange).toHaveBeenCalledTimes(1);
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
      sc.page({
        pageId: "page1",
        content: sc.generatePageContent("modified content")
      })
    ];

    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);
    const corvidPath = path.join(localSitePath, ".corvid");
    await fs.ensureDir(corvidPath);
    const watchHandler = jest.fn();
    const watcher = fs.watch(corvidPath, watchHandler);
    await editor.save();

    await eventually(() => {
      expect(watchHandler).toHaveBeenCalledWith("rename", "backup");
    });

    await watcher.close();
  });

  it("should not fail save if cannot save a backup", async () => {
    const originalSite = sc.fullSiteItems();
    const updatedSite = sc.fullSiteItems();

    const localSitePath = await localSiteDir.initLocalSite(
      localSiteBuilder.buildPartial(...originalSite)
    );
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const backupPath = backupsPath(localSitePath);
    await fs.mkdir(backupPath);

    await fs.chmod(backupPath, 0o400); // owner can only read

    editor.modifySite(editorSiteBuilder.buildPartial(...updatedSite));
    await editor.save();

    expect(await localSiteDir.readLocalSite(localSitePath)).toMatchObject(
      localSiteBuilder.buildPartial(...updatedSite)
    );
  });
});
