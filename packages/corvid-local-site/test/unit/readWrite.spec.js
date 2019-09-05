const flat = require("flat");
const map_ = require("lodash/map");

const { localSiteDir } = require("corvid-local-test-utils");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");

const initLocalSiteManager = require("../../src/init");

describe("read write", () => {
  describe("parallel reads & writes", () => {
    it("should not allow reading and writing at the same time", async () => {
      const localSiteRootPath = await localSiteDir.initLocalSite();
      const localSite = await initLocalSiteManager(localSiteRootPath);

      const exampleSite1 = editorSiteBuilder.buildFull();
      const exampleSite2 = editorSiteBuilder.buildFull();
      const exampleSite3 = editorSiteBuilder.buildFull();

      const results = [];

      const updateCodePayload = siteCode => {
        const flattnedCode = flat(siteCode, { delimiter: "/", safe: true });
        return {
          modifiedFiles: map_(flattnedCode, (content, path) => ({
            path,
            content
          }))
        };
      };

      localSite
        .updateSiteDocument(exampleSite1.siteDocument)
        .then(() => results.push(1));
      localSite.getSiteDocument().then(() => results.push(2));
      localSite
        .updateCode(updateCodePayload(exampleSite1.siteCode))
        .then(() => results.push(3));
      localSite.getCodeFiles().then(() => results.push(4));
      localSite
        .updateCode(updateCodePayload(exampleSite2.siteCode))
        .then(() => results.push(5));
      localSite.getSiteDocument().then(() => results.push(6));
      localSite.getCodeFiles().then(() => results.push(7));
      localSite
        .updateSiteDocument(exampleSite2.siteDocument)
        .then(() => results.push(8));
      localSite.getCodeFiles().then(() => results.push(9));
      localSite.getSiteDocument().then(() => results.push(10));
      localSite
        .updateCode(updateCodePayload(exampleSite3.siteCode))
        .then(() => results.push(11));
      await localSite
        .updateSiteDocument(exampleSite3.siteDocument)
        .then(() => results.push(12));

      expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });
});
