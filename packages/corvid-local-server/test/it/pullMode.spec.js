const path = require("path");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { siteCreators: sc, initTempDir } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");
const { readDirToJson } = require("corvid-dir-as-json");

const now = Date.now();
jest.spyOn(Date, "now").mockImplementation(() => now);

afterEach(closeAll);

describe("pull mode", () => {
  describe("force pull", () => {
    it("should not start the server in pull mode for a non corvid project directory", async () => {
      const localPath = await initTempDir({
        src: {
          "something.js": "console.log('something')"
        },
        "package.json": "blah blah blah"
      });

      const server = localServer.startInCloneMode(localPath, {
        override: true
      });

      await expect(server).rejects.toThrow("CAN_NOT_PULL_NON_WIX_SITE");
    });

    it("should replace the existing with the one from the editor", async () => {
      const editorSiteItems = sc.fullSiteItems();
      const editorSite = editorSiteBuilder.buildPartial(...editorSiteItems);
      const localSite = localSiteBuilder.buildFull();

      const localSitePath = await initLocalSite(localSite);
      const server = await localServer.startInCloneMode(localSitePath, {
        override: true
      });
      await loadEditor(server.port, editorSite);

      const localSiteFiles = await readLocalSite(localSitePath);
      expect(localSiteFiles).toMatchObject(
        localSiteBuilder.buildPartial(...editorSiteItems)
      );
    });
  });
  describe("move pull", () => {
    it("should not start the server in pull mode for a non corvid project directory", async () => {
      const localPath = await initTempDir({
        src: {
          "something.js": "console.log('something')"
        },
        "package.json": "blah blah blah"
      });

      const server = localServer.startInCloneMode(localPath, {
        move: true
      });

      await expect(server).rejects.toThrow("CAN_NOT_PULL_NON_WIX_SITE");
    });
    it("should move the existing local site to .corvid/snapshots/{timestemp}", async () => {
      const initialLocalSiteFiles = localSiteBuilder.buildFull();

      const localSitePath = await initLocalSite(initialLocalSiteFiles);
      await localServer.startInCloneMode(localSitePath, {
        move: true
      });

      const movedSnapshot = await readDirToJson(
        path.join(localSitePath, ".corvid", "snapshots", Date.now().toString())
      );
      expect(movedSnapshot).toEqual(initialLocalSiteFiles);
    });
    it("should download the latest site from the editor", async () => {
      const editorSiteItems = sc.fullSiteItems();
      const editorSite = editorSiteBuilder.buildPartial(...editorSiteItems);
      const initialLocalSiteFiles = localSiteBuilder.buildFull();

      const localSitePath = await initLocalSite(initialLocalSiteFiles);
      const server = await localServer.startInCloneMode(localSitePath, {
        move: true
      });
      await loadEditor(server.port, editorSite);

      const localSiteFiles = await readLocalSite(localSitePath);
      expect(localSiteFiles).toMatchObject(
        localSiteBuilder.buildPartial(...editorSiteItems)
      );
    });
  });
});
