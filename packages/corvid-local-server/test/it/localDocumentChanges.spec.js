const eventually = require("wix-eventually");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite, writeFile, deleteFile }
} = require("corvid-local-testkit");

const documentCreatorsTypes = Object.keys(sc.documentCreators);

afterEach(closeAll);
describe("local changes", () => {
  describe("DOCUMENT", () => {
    it.each(documentCreatorsTypes)(
      `should notify the editor when a [%s] item is added`,
      async itemKey => {
        const onDocumentChange = jest.fn();
        const fullSiteWithoutItem = sc.fullSiteItems();

        const localSiteFiles = localSiteBuilder.buildPartial(
          ...fullSiteWithoutItem
        );
        const localSitePath = await initLocalSite(localSiteFiles);

        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(server.port);

        const unsubscribeFromCodeChange = editor.registerDocumentChange(
          onDocumentChange
        );

        const docItem = sc[itemKey]();
        let filePath = localSiteBuilder.getLocalFilePath(docItem);
        let fileContent = localSiteBuilder.getLocalFileContent(docItem);

        await writeFile(localSitePath, filePath, fileContent);

        await eventually(async () => {
          expect(onDocumentChange).toHaveBeenCalled();
        });
        unsubscribeFromCodeChange();
      }
    );

    it.each(documentCreatorsTypes)(
      `should notify the editor when a [%s] item is modified`,
      async itemKey => {
        const docItem = sc[itemKey]();
        const onDocumentChange = jest.fn();

        const localSiteFiles = localSiteBuilder.buildFull(docItem);
        const localSitePath = await initLocalSite(localSiteFiles);

        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(server.port);

        const unsubscribeFromCodeChange = editor.registerDocumentChange(
          onDocumentChange
        );

        let filePath = localSiteBuilder.getLocalFilePath(docItem);
        let fileContent = localSiteBuilder.getLocalFileContent(sc[itemKey]());

        await writeFile(localSitePath, filePath, fileContent);

        await eventually(async () => {
          expect(onDocumentChange).toHaveBeenCalled();
        });
        unsubscribeFromCodeChange();
      }
    );

    it.each(documentCreatorsTypes)(
      `should notify the editor when a [%s] item is deleted`,
      async itemKey => {
        const docItem = sc[itemKey]();
        const onDocumentChange = jest.fn();

        const localSiteFiles = localSiteBuilder.buildFull(docItem);
        const localSitePath = await initLocalSite(localSiteFiles);

        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(server.port);

        const unsubscribeFromCodeChange = editor.registerDocumentChange(
          onDocumentChange
        );

        let filePath = localSiteBuilder.getLocalFilePath(docItem);

        await deleteFile(localSitePath, filePath);

        await eventually(async () => {
          expect(onDocumentChange).toHaveBeenCalled();
        });
        unsubscribeFromCodeChange();
      }
    );

    it("should not trigger watcher callbacks on document save", async () => {
      const renamedPage = sc.page({
        pageId: "test-page",
        title: "original title"
      });
      const renamedLightobx = sc.lightbox({
        pageId: "test-lightbox",
        title: "original title"
      });

      const originalEditorSite = editorSiteBuilder.buildFull(
        renamedPage,
        renamedLightobx
      );
      const newEditorSite = editorSiteBuilder.buildFull(
        Object.assign({}, renamedPage, { title: "new title" }),
        Object.assign({}, renamedLightobx, { title: "new title" })
      );

      const localSitePath = await initLocalSite();
      const server = await localServer.startInCloneMode(localSitePath);

      const editor = await loadEditor(server.port, originalEditorSite);

      const onChange = jest.fn();
      editor.registerDocumentChange(onChange);
      editor.registerCodeChange(onChange);

      editor.modifySite(newEditorSite);

      await editor.save();

      expect(onChange).not.toHaveBeenCalled();

      const newPage = sc.page();
      await writeFile(
        localSitePath,
        localSiteBuilder.getLocalFilePath(newPage),
        localSiteBuilder.getLocalFileContent(newPage)
      );

      await eventually(async () => {
        expect(onChange).toHaveBeenCalledTimes(1);
      });
    });
  });
});
// todo:: make sure when a user is changing file locally on unfamiller folders we should not nofity the editor
