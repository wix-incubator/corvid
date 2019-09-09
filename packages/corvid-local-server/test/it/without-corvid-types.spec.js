const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
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
describe("corvid-types is NOT available", () => {
  it("should not create tsconfig file in backend and public folders", async () => {
    const fullEditorSite = editorSiteBuilder.buildFull();
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);
    await loadEditor(server.port, fullEditorSite);

    const isBackendTsConfigExists = await doesExist(
      localSitePath,
      "backend/tsconfig.json"
    );

    const isPublicTsConfigExists = await doesExist(
      localSitePath,
      "public/tsconfig.json"
    );

    expect(isBackendTsConfigExists).toBe(false);
    expect(isPublicTsConfigExists).toBe(false);
  });

  it("should not create tsconfig file in pages folders", async () => {
    const fullEditorSite = editorSiteBuilder.buildFull();
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);
    await loadEditor(server.port, fullEditorSite);
    const localSiteFiles = await readLocalSite(localSitePath);

    Object.values(localSiteFiles.pages).forEach(async page => {
      expect(page.hasOwnProperty("tsconfig.json")).toBe(false);
    });
  });
});
