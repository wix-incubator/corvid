// const {
//   editor: loadEditor,
//   editorSiteBuilder
// } = require("@wix/fake-local-mode-editor");
// const { localSiteBuilder } = require("@wix/wix-code-local-site/testkit");
// const { siteCreators: sc } = require("@wix/wix-code-local-test-utils");
// const localServer = require("../../src/server");
// const {
//   initLocalSite,
//   readLocalSite,
//   isFolderExsist
// } = require("../utils/localSiteDir");

// describe("local changes", () => {
//   it.each`
//     folder
//     ${"frontend"}
//     ${"public"}
//     ${"backend"}
//   `(
//     "should update the editor when a file is add to $folder folder",
//     async ({ folder }) => {
//       const siteItems = sc.fullSiteItems();

//       const editorSite = editorSiteBuilder.buildPartial(...siteItems);

//       const localSitePath = await initLocalSite();
//       const server = await localServer.startInCloneMode(localSitePath);
//       const editor = await loadEditor(server.port, editorSite);

//       await editor.close();
//       await server.close();
//     }
//   );
//   it.each`
//     folder
//     ${"frontend"}
//     ${"public"}
//     ${"backend"}
//   `(
//     "should update the editor when a folder is add to $folder folder",
//     async ({ folder }) => {}
//   );
//   it("should not update the editor when a file is add to unfamiliar folder", async () => {});
//   it("should not update the editor when a folder is add to unfamiliar folder", async () => {});
// });
