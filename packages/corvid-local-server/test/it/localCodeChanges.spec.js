const eventually = require("wix-eventually");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite, writeFile, deleteFile },
  getEditorOptions
} = require("corvid-local-test-utils");

const codeItemsTypes = Object.keys(sc.codeCreators);

const createCodeChangePayload = (path, content) => ({
  modifiedFiles: [{ path, content }],
  deletedFiles: []
});

const createCodeDeletePayload = path => ({
  modifiedFiles: [],
  deletedFiles: [{ path }]
});

afterEach(closeAll);
describe("local changes", () => {
  describe("CODE", () => {
    it.each(codeItemsTypes)(
      `should notify the editor when a [%s] item is added`,
      async itemKey => {
        const onCodeChange = jest.fn();
        const fullSiteWithoutItem = sc.fullSiteItems();

        const localSiteFiles = localSiteBuilder.buildPartial(
          ...fullSiteWithoutItem
        );
        const localSitePath = await initLocalSite(localSiteFiles);

        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(getEditorOptions(server));

        const unsubscribeFromCodeChange = editor.registerCodeChange(
          onCodeChange
        );

        const code = sc[itemKey]();
        const filePath = localSiteBuilder.getLocalFilePath(code, "code");
        const fileContent = localSiteBuilder.getLocalFileContent(code, "code");

        const watcherPayload = createCodeChangePayload(
          editorSiteBuilder.getEditorCodeFilePath(code),
          fileContent
        );

        await writeFile(localSitePath, filePath, fileContent);

        await eventually(async () => {
          expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
        });
        unsubscribeFromCodeChange();
      }
    );

    it.each(codeItemsTypes)(
      `should notify the editor when a [%s] item is modified`,
      async itemKey => {
        const onCodeChange = jest.fn();
        const code = sc[itemKey]();
        const localSiteFiles = localSiteBuilder.buildFull(code);

        const localSitePath = await initLocalSite(localSiteFiles);
        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(getEditorOptions(server));

        const unsubscribeFromCodeChange = editor.registerCodeChange(
          onCodeChange
        );
        const filePath = localSiteBuilder.getLocalFilePath(code, "code");
        const fileContent = localSiteBuilder.getLocalFileContent(
          sc[itemKey](),
          "code"
        );

        const watcherPayload = createCodeChangePayload(
          editorSiteBuilder.getEditorCodeFilePath(code),
          fileContent
        );

        await writeFile(localSitePath, filePath, fileContent);

        await eventually(async () => {
          expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
        });
        unsubscribeFromCodeChange();
      }
    );

    it.each(codeItemsTypes)(
      `should notify the editor when a [%s] item is deleted`,
      async itemKey => {
        const onCodeChange = jest.fn();
        const code = sc[itemKey]();
        const localSiteFiles = localSiteBuilder.buildFull(code);

        const localSitePath = await initLocalSite(localSiteFiles);
        const server = await localServer.startInEditMode(localSitePath);
        const editor = await loadEditor(getEditorOptions(server));

        const unsubscribeFromCodeChange = editor.registerCodeChange(
          onCodeChange
        );
        const filePath = localSiteBuilder.getLocalFilePath(code, "code");

        await deleteFile(localSitePath, filePath);

        const watcherPayload = createCodeDeletePayload(
          editorSiteBuilder.getEditorCodeFilePath(code)
        );
        await eventually(async () => {
          expect(onCodeChange).toHaveBeenCalledWith(watcherPayload);
        });
        unsubscribeFromCodeChange();
      }
    );
  });
});
// todo:: make sure when a user is changing file locally on unfamiller folders we should not nofity the editor
