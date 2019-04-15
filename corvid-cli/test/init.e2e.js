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
const { init } = require("../src/commands/init");

describe("init", () => {
  process.env.CORVID_SESSION_ID = "testCorvidId";
  beforeEach(async () => {
    const localEditorServerPort = await localFakeEditorServer.start();
    process.env.CORVID_CLI_WIX_DOMAIN = `localhost:${localEditorServerPort}`;
    process.env.DISABLE_SSL = true;
  });

  afterEach(() => {
    sessionData.reset();
    localFakeEditorServer.killAllRunningServers();
    fetchMock.restore();
  });

  describe("should create a .corvidrc.json", () => {
    test("at the supplied directory", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "12345678",
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await init({
        url: "a-site.com",
        dir: tempDir
      });

      expect(() =>
        fs.readFileSync(path.join(tempDir, "aSite", ".corvidrc.json"), "utf8")
      ).not.toThrow();
    });

    test("with the metasiteId of the site specified by the url", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "12345678",
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await init({
        url: "a-site.com",
        dir: tempDir
      });

      const corvidrc = JSON.parse(
        fs.readFileSync(path.join(tempDir, "aSite", ".corvidrc.json"), "utf8")
      );

      expect(corvidrc).toMatchObject({ metasiteId: "12345678" });
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
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await init({
        url: "a-site.com",
        dir: tempDir
      });

      const corvidrc = JSON.parse(
        fs.readFileSync(path.join(tempDir, "aSite", ".corvidrc.json"), "utf8")
      );

      expect(corvidrc).toMatchObject({ cliVersion: cliModuleVersion });
    });

    test("should report to BI an init start event with the userGuid and metasiteId", async () => {
      expect.assertions(1);

      const tempDir = await initTempDir({ aSite: {} });

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "87654321",
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await init({
        url: "a-site.com",
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`
        )
      ).toBe(true);
    });

    test("should report to BI an init success event with the userGuid and metasiteId", async () => {
      expect.assertions(1);

      const tempDir = await initTempDir({ aSite: {} });

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "87654321",
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await init({
        url: "a-site.com",
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=200&msid=87654321&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`
        )
      ).toBe(true);
    });

    test("should clone the site", () => {});
  });

  describe("when the target directory is not empty", () => {
    test("should exit with an error", async () => {
      expect.assertions(1);

      const tempDir = await initTempDir({ aSite: { aFile: "file contents" } });
      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "asdfghjkl",
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=asdfghjkl&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=asdfghjkl&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=fail`,
          JSON.stringify({})
        );

      return expect(
        init({
          url: "a-site.com",
          dir: tempDir
        })
      ).rejects.toThrow(
        `Target directory ${path.join(tempDir, "aSite")} is not empty`
      );
    });

    test("should report to BI an init fail event", async () => {
      expect.assertions(1);

      const tempDir = await initTempDir({ aSite: { aFile: "file contents" } });
      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify(
            [
              {
                metasiteId: "asdfghjkl",
                publicUrl: "http://a-site.com",
                siteName: "aSite"
              }
            ],
            null,
            2
          )
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=asdfghjkl&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=asdfghjkl&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=fail`,
          JSON.stringify({})
        );

      await init({
        url: "a-site.com",
        dir: tempDir
      }).catch(() => {});

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=200&msid=asdfghjkl&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=fail`
        )
      ).toBe(true);
    });
  });

  describe("given an editor URL", () => {
    test("should exit with an error if the site is not returned by listUserSites", () => {
      expect.assertions(1);

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify([], null, 2)
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=fail`,
          JSON.stringify({})
        );

      return expect(
        init({
          url:
            "https://editor.wix.com/html/editor/web/renderer/edit/1633ae83-c9ff-41e2-bd1b-d5eb5a93790c?metaSiteId=96d0802a-b76d-411c-aaf4-6b8c2f474acb&editorSessionId=d3a513bd-32a0-5e3b-964e-3b69f916f17e",
          dir: "someFolder"
        })
      ).rejects.toThrow(/Could not extract the site name of .*/);
    });
  });

  describe("given an pre-redirect editor URL", () => {
    test("should exit with an error if the site is not returned by listUserSites", () => {
      expect.assertions(1);

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify([], null, 2)
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=fail`,
          JSON.stringify({})
        );

      return expect(
        init({
          url:
            "https://www.wix.com/editor/96d0802a-b76d-411c-aaf4-6b8c2f474acb",
          dir: "someFolder"
        })
      ).rejects.toThrow(/Could not extract the site name of .*/);
    });
  });
});
