const fetchMock = require("fetch-mock");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { initTempDir } = require("corvid-local-test-utils");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");
const sessionData = require("../src/utils/sessionData");

jest.mock("../src/commands/login");
const { pullHandler } = require("../src/commands/pull");

describe("pull", () => {
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

  describe("when run in a directory with a config file and no site files", () => {
    test("should report to stdout when the process is complete", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({
        ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
      });

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
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success&type=regular`,
          JSON.stringify({})
        );

      return expect(
        pullHandler({
          dir: tempDir
        })
      ).resolves.toMatch(/Pull complete/);
    });

    test("should report to BI a pull start event", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({
        ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
      });

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
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success&type=regular`,
          JSON.stringify({})
        );

      await pullHandler({
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`
        )
      ).toBe(true);
    });

    test("should report to BI a pull success event", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({
        ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
      });

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
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success&type=regular`,
          JSON.stringify({})
        );

      await pullHandler({
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success&type=regular`
        )
      ).toBe(true);
    });
  });

  describe("when run in a directory with a config file and site files", () => {
    test("should report to BI a pull start event", async () => {
      expect.assertions(1);
      const localSiteFiles = localSiteBuilder.buildFull();
      const tempDir = await initTempDir(
        Object.assign(
          {
            ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
          },
          { src: localSiteFiles }
        )
      );

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
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=fail&type=regular`,
          JSON.stringify({})
        );

      await pullHandler({
        dir: tempDir
      }).catch(() => {});

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`
        )
      ).toBe(true);
    });

    test("should report to BI a pull fail event", async () => {
      expect.assertions(1);
      const localSiteFiles = localSiteBuilder.buildFull();
      const tempDir = await initTempDir(
        Object.assign(
          {
            ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
          },
          { src: localSiteFiles }
        )
      );

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
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start&type=regular`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=fail&type=regular`,
          JSON.stringify({})
        );

      await pullHandler({
        dir: tempDir
      }).catch(() => {});

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=fail&type=regular`
        )
      ).toBe(true);
    });

    describe("and given the --override flag", () => {
      test("should report to BI a pull start event", async () => {
        expect.assertions(1);
        const localSiteFiles = localSiteBuilder.buildFull();
        const tempDir = await initTempDir(
          Object.assign(
            {
              ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
            },
            { src: localSiteFiles }
          )
        );

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
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start&type=override`,
            JSON.stringify({})
          )
          .mock(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success&type=override`,
            JSON.stringify({})
          );

        await pullHandler({
          dir: tempDir,
          override: true
        }).catch(() => {});

        expect(
          fetchMock.called(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start&type=override`
          )
        ).toBe(true);
      });

      test("should report to BI a pull success event", async () => {
        expect.assertions(1);
        const localSiteFiles = localSiteBuilder.buildFull();
        const tempDir = await initTempDir(
          Object.assign(
            {
              ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
            },
            { src: localSiteFiles }
          )
        );

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
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start&type=override`,
            JSON.stringify({})
          )
          .mock(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success&type=override`,
            JSON.stringify({})
          );

        await pullHandler({
          dir: tempDir,
          override: true
        }).catch(() => {});

        expect(
          fetchMock.called(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success&type=override`
          )
        ).toBe(true);
      });
    });

    describe("and given the --move flag", () => {
      test("should report to BI a pull start event", async () => {
        expect.assertions(1);
        const localSiteFiles = localSiteBuilder.buildFull();
        const tempDir = await initTempDir(
          Object.assign(
            {
              ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
            },
            { src: localSiteFiles }
          )
        );

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
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start&type=move`,
            JSON.stringify({})
          )
          .mock(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success&type=move`,
            JSON.stringify({})
          );

        await pullHandler({
          dir: tempDir,
          move: true
        }).catch(() => {});

        expect(
          fetchMock.called(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start&type=move`
          )
        ).toBe(true);
      });

      test("should report to BI a pull success event", async () => {
        expect.assertions(1);
        const localSiteFiles = localSiteBuilder.buildFull();
        const tempDir = await initTempDir(
          Object.assign(
            {
              ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
            },
            { src: localSiteFiles }
          )
        );

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
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start&type=move`,
            JSON.stringify({})
          )
          .mock(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success&type=move`,
            JSON.stringify({})
          );

        await pullHandler({
          dir: tempDir,
          move: true
        }).catch(() => {});

        expect(
          fetchMock.called(
            `http://frog.wix.com/code?src=39&evid=202&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success&type=move`
          )
        ).toBe(true);
      });
    });
  });

  describe("when run in a directory without a config file", () => {
    test("should print to stderr a message explaining the error", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({});

      return expect(
        pullHandler({
          dir: tempDir
        })
      ).rejects.toThrow(/Project not found in/);
    });
  });
});
