const path = require("path");
const fs = require("fs");
const process = require("process");
const fetchMock = require("fetch-mock");
const { version: cliModuleVersion } = require("../package.json");
const { initTempDir } = require("corvid-local-test-utils");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");
const sessionData = require("../src/utils/sessionData");

jest.mock("../src/commands/login");
const { clone } = require("../src/commands/clone");
const base64 = require("./utils/base64");

describe("clone", () => {
  process.env.CORVID_SESSION_ID = "testCorvidId";
  let editorServer;
  beforeEach(async () => {
    editorServer = await localFakeEditorServer.start();
    process.env.CORVID_CLI_WIX_DOMAIN = `localhost:${editorServer.port}`;
    process.env.DISABLE_SSL = true;
  });

  afterEach(() => {
    sessionData.reset();
    localFakeEditorServer.killAllRunningServers();
    fetchMock.restore();
  });

  const setupSuccessfullClone = async () => {
    const tempDir = await initTempDir();
    const siteUrl = "http://a-site.com";

    fetchMock
      .mock(
        "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
        JSON.stringify(
          [
            {
              metasiteId: "12345678",
              publicUrl: siteUrl
            }
          ],
          null,
          2
        )
      )
      .mock(
        `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
          process.env.CORVID_SESSION_ID
        }&status=start`,
        JSON.stringify({})
      )
      .mock(
        `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
          process.env.CORVID_SESSION_ID
        }&status=success`,
        JSON.stringify({})
      );

    return { tempDir, siteUrl };
  };

  describe("should create a .corvid/corvidrc.json", () => {
    test("at the supplied directory", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "12345678",
                publicUrl: "http://a-site.com"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url: "a-site.com",
        dir: tempDir
      });

      expect(() =>
        fs.readFileSync(path.join(tempDir, ".corvid", "corvidrc.json"), "utf8")
      ).not.toThrow();
    });

    test("with the metasiteId of the site specified by a public site url", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "12345678",
                publicUrl: "http://a-site.com"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url: "a-site.com",
        dir: tempDir
      });

      const corvidMetadata = JSON.parse(
        fs.readFileSync(path.join(tempDir, ".corvid", "corvidrc.json"), "utf8")
      );

      expect(corvidMetadata).toMatchObject({ metasiteId: "12345678" });
    });

    test("with the metasiteId of the site specified by an editor url", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify([], null, 2)
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url:
          "https://editor.wix.com/html/editor/web/renderer/edit/1633ae83-c9ff-41e2-bd1b-d5eb5a93790c?metaSiteId=96d0802a-b76d-411c-aaf4-6b8c2f474acb&editorSessionId=d3a513bd-32a0-5e3b-964e-3b69f916f17e",
        dir: tempDir
      });

      const corvidMetadata = JSON.parse(
        fs.readFileSync(path.join(tempDir, ".corvid", "corvidrc.json"), "utf8")
      );

      expect(corvidMetadata).toMatchObject({
        metasiteId: "96d0802a-b76d-411c-aaf4-6b8c2f474acb"
      });
    });

    test("with the metasiteId of the site specified by a pre-redirect editor url", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify([], null, 2)
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url: "https://www.wix.com/editor/96d0802a-b76d-411c-aaf4-6b8c2f474acb",
        dir: tempDir
      });

      const corvidMetadata = JSON.parse(
        fs.readFileSync(path.join(tempDir, ".corvid", "corvidrc.json"), "utf8")
      );

      expect(corvidMetadata).toMatchObject({
        metasiteId: "96d0802a-b76d-411c-aaf4-6b8c2f474acb"
      });
    });

    test("with the current cli module version", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "12345678",
                publicUrl: "http://a-site.com"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url: "a-site.com",
        dir: tempDir
      });

      const corvieMetadata = JSON.parse(
        fs.readFileSync(path.join(tempDir, ".corvid", "corvidrc.json"), "utf8")
      );

      expect(corvieMetadata).toMatchObject({ cliVersion: cliModuleVersion });
    });

    test("should report to BI a clone start event with the userGuid and metasiteId", async () => {
      expect.assertions(1);

      const tempDir = await initTempDir({ aSite: {} });

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "87654321",
                publicUrl: "http://a-site.com"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url: "a-site.com",
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`
        )
      ).toBe(true);
    });

    test("should report to BI a clone success event with the userGuid and metasiteId", async () => {
      expect.assertions(1);

      const tempDir = await initTempDir({ aSite: {} });

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "87654321",
                publicUrl: "http://a-site.com"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await clone({
        url: "a-site.com",
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`
        )
      ).toBe(true);
    });

    test("should clone the site", () => {});
  });

  describe("bi context", () => {
    const expectedCloneBiContext = JSON.stringify({
      builderEnv: "local",
      isHeadless: true
    });

    test("should open the editor with the correct bi context query parameter", async () => {
      const { tempDir, siteUrl } = await setupSuccessfullClone();

      const biContextQueryPromise = new Promise(resolve => {
        editorServer.onEditorRequest(req => {
          resolve(req.query["x-wix-bi-context"]);
        });
      });

      await clone({
        url: siteUrl,
        dir: tempDir
      });

      const biContextQueryValue = await biContextQueryPromise;

      expect(base64.decode(biContextQueryValue)).toEqual(
        expectedCloneBiContext
      );
    });

    test("should open the editor with the correct bi context header ", async () => {
      const { tempDir, siteUrl } = await setupSuccessfullClone();

      const biContextHeaderPromise = new Promise(resolve => {
        editorServer.onEditorRequest(req => {
          resolve(req.get("x-wix-bi-context"));
        });
      });

      await clone({
        url: siteUrl,
        dir: tempDir
      });

      const biContextHeaderValue = await biContextHeaderPromise;

      expect(base64.decode(biContextHeaderValue)).toEqual(
        expectedCloneBiContext
      );
    });
  });
});
