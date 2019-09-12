const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite, doesExist, readLocalSite }
} = require("corvid-local-test-utils");
jest.mock("corvid-types", () => {
  throw new Error("Cannot find module 'corvid-types' from 'codeCompletion.js'");
});
afterEach(closeAll);
describe("user did NOT installed corvid-types", () => {
  describe("tsconfig file", () => {
    it("should not create tsconfig file in backend and public folders", async () => {
      const fullEditorSite = editorSiteBuilder.buildFull();
      const localSitePath = await initLocalSite();
      const server = await localServer.startInCloneMode(localSitePath);
      await loadEditor(server.port, fullEditorSite);

      expect(await doesExist(localSitePath, "backend/tsconfig.json")).toEqual(
        false
      );
      expect(await doesExist(localSitePath, "public/tsconfig.json")).toEqual(
        false
      );
    });

    it.each(["pages", "lightboxes"])(
      "should not create tsconfig files in % folders",
      async folder => {
        const fullEditorSite = editorSiteBuilder.buildFull();
        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);
        await loadEditor(server.port, fullEditorSite);
        const localSiteFiles = await readLocalSite(localSitePath);

        Object.values(localSiteFiles[folder]).forEach(async page => {
          expect(page.hasOwnProperty(localSiteBuilder.TS_CONFIG_NAME)).toEqual(
            false
          );
        });
      }
    );
  });
  describe("typings files", () => {
    it.each(["pages", "lightboxes"])(
      "should not create typings files in % folders",
      async folder => {
        const fullEditorSite = editorSiteBuilder.buildFull();
        const localSitePath = await initLocalSite();
        const server = await localServer.startInCloneMode(localSitePath);
        await loadEditor(server.port, fullEditorSite);
        const localSiteFiles = await readLocalSite(localSitePath);

        Object.values(localSiteFiles[folder]).forEach(async page => {
          expect(page.hasOwnProperty(localSiteBuilder.D_TS_NAME)).toEqual(
            false
          );
        });
      }
    );
  });
});
