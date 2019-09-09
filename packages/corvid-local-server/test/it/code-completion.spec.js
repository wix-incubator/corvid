// const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
// const { localSiteBuilder } = require("corvid-local-site/testkit");
// const { siteCreators: sc } = require("corvid-local-test-utils");
// const {
//   editor: loadEditor,
//   localServer,
//   closeAll
// } = require("../utils/autoClosing");
// const {
//   localSiteDir: { initLocalSite, readLocalSite, doesExist: doesLocalFileExist }
// } = require("corvid-local-test-utils");

// afterEach(closeAll);

describe("Code Completion", () => {
  describe("tsconfig", () => {
    describe("perform clone command", () => {
      it("should add tsconfig file to the backend root folder", async () => {
        // const siteItems = sc.fullSiteItems();
        // const editorSite = editorSiteBuilder.buildPartial(...siteItems);
        // const expectedLocalSite = localSiteBuilder.buildPartial(...siteItems);
        // const localSitePath = await initLocalSite();
        // const server = await localServer.startInCloneMode(localSitePath);
        // await loadEditor(server.port, editorSite);
        // const localSiteFiles = await readLocalSite(localSitePath);
        // todo:: change localSiteBuilder to add empty code page by default (when page cerator is called)
        // expect(localSiteFiles).toMatchObject(expectedLocalSite);
      });
      it("should add tsconfig file to the public root folder", async () => {});
      it("should add tsconfig file to every page folders", async () => {});
      it("should add tsconfig file to every lightbox folders", async () => {});
      it("should add tsconfig file to site folder", async () => {});
    });
    describe("perform edit command", () => {
      describe("page deleted from the editor and local saved", () => {
        it("should delete the root page folder", async () => {});
      });
      describe("page renamed from the editor and local saved", () => {
        it("should move the tsconfig file to the new root page folder", async () => {});
      });
      describe("page created from the editor and local saved", () => {
        it("should add a tsconfig file to the new root page folder", async () => {});
      });
    });
  });
});
// todo:: add cases of sites without tsconfigs and that save command will add them
