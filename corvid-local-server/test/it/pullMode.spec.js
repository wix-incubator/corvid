const omit_ = require("lodash/omit");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { siteCreators: sc } = require("corvid-local-test-utils");
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");

const getConfig = expectedLocalSite => ({
  ".corvidrc.json": expectedLocalSite[".corvidrc.json"]
});
const now = Date.now();
jest.spyOn(Date, "now").mockImplementation(() => now);

afterEach(closeAll);

describe("pull mode", () => {
  describe("force pull", () => {
    it("should not start the server in pull mode if no .corvidrc.json exists in site directory", async () => {
      const localSitePath = await initLocalSite();

      const server = localServer.startInCloneMode(localSitePath, {
        force: true
      });

      await expect(server).rejects.toThrow("CAN_NOT_PULL_NON_WIX_SITE");
    });
    it("should remove exsisting site", async () => {
      const corvidrc = sc.corvidrc();
      const initialLocalSiteFiles = localSiteBuilder.buildFull(corvidrc);

      const localSitePath = await initLocalSite(initialLocalSiteFiles);
      await localServer.startInCloneMode(localSitePath, {
        force: true
      });

      const localSiteFiles = await readLocalSite(localSitePath);
      expect(localSiteFiles).toEqual(getConfig(initialLocalSiteFiles));
    });

    it("should remove exsisting site and download the latest site from the editor", async () => {
      const corvidrc = sc.corvidrc();
      const siteItems = sc.fullSiteItems();
      const editorSite = editorSiteBuilder.buildPartial(...siteItems);
      const initialLocalSiteFiles = localSiteBuilder.buildFull(corvidrc);

      const localSitePath = await initLocalSite(initialLocalSiteFiles);
      const server = await localServer.startInCloneMode(localSitePath, {
        force: true
      });
      await loadEditor(server.port, editorSite);

      const localSiteFiles = await readLocalSite(localSitePath);
      const expectedLocalSiteFiles = localSiteBuilder.buildPartial(
        ...siteItems,
        corvidrc
      );
      expect(localSiteFiles).toMatchObject(expectedLocalSiteFiles);
    });
  });
  describe("move pull", () => {
    it("should not start the server in pull mode if no .corvidrc.json exists in site directory", async () => {
      const localSitePath = await initLocalSite();

      const server = localServer.startInCloneMode(localSitePath, {
        move: true
      });

      await expect(server).rejects.toThrow("CAN_NOT_PULL_NON_WIX_SITE");
    });
    it("should move exsisting site to snapshots/timestemp", async () => {
      const corvidrc = sc.corvidrc();
      const initialLocalSiteFiles = localSiteBuilder.buildFull(corvidrc);

      const localSitePath = await initLocalSite(initialLocalSiteFiles);
      await localServer.startInCloneMode(localSitePath, {
        move: true
      });
      const expectedLocalSiteFiles = {
        [Date.now()]: omit_(initialLocalSiteFiles, ".corvidrc.json")
      };
      const localSiteFiles = await readLocalSite(localSitePath);
      expect(localSiteFiles.snapshots).toEqual(expectedLocalSiteFiles);
    });
    it("should move exsisting site to snapshots/timestemp and download the latest site from the editor", async () => {
      const corvidrc = sc.corvidrc();
      const siteItems = sc.fullSiteItems();
      const editorSite = editorSiteBuilder.buildPartial(...siteItems);
      const initialLocalSiteFiles = localSiteBuilder.buildFull(corvidrc);

      const localSitePath = await initLocalSite(initialLocalSiteFiles);
      const server = await localServer.startInCloneMode(localSitePath, {
        move: true
      });
      await loadEditor(server.port, editorSite);

      const localSiteFiles = await readLocalSite(localSitePath);
      const expectedLocalSiteFiles = localSiteBuilder.buildPartial(
        ...siteItems,
        corvidrc
      );
      expect(localSiteFiles).toMatchObject(expectedLocalSiteFiles);
    });
  });
});
