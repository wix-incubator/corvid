const fetchMock = require("fetch-mock");
const { initTempDir } = require("corvid-local-test-utils");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");
const sessionData = require("../src/utils/sessionData");
const { killAllChildProcesses } = require("../src/utils/electron");

jest.mock("../src/commands/login");
const { openEditorHandler } = require("../src/commands/open-editor");

describe("edit", () => {
  jest.setTimeout(10000);
  process.env.CORVID_SESSION_ID = "testCorvidId";
  process.env.CORVID_FORCE_HEADLESS = 1;

  afterEach(() => {
    sessionData.reset();
    fetchMock.restore();
    killAllChildProcesses();
  });

  describe("when run in a directory with a local version of the site", () => {
    beforeEach(async () => {
      const localEditorServerPort = await localFakeEditorServer.start();
      process.env.CORVID_CLI_WIX_DOMAIN = `localhost:${localEditorServerPort}`;
      process.env.DISABLE_SSL = true;
    });

    afterEach(() => {
      localFakeEditorServer.killAllRunningServers();
    });

    test("should open the editor with the local server port", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({
        ".corvidrc.json": '{ "metasiteId": "12345678" }',
        src: {
          backend: {},
          frontend: {},
          public: {},
          database: {}
        }
      });

      return expect(
        openEditorHandler({
          dir: tempDir
        })
      ).resolves.toBeUndefined();
    });

    test("should report to BI an open-editor start event", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({
        ".corvidrc.json": '{ "metasiteId": "12345678" }',
        src: {
          backend: {},
          frontend: {},
          public: {},
          database: {}
        }
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
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await openEditorHandler({
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`
        )
      ).toBe(true);
    });

    test("should report to BI an open-editor success event", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({
        ".corvidrc.json": '{ "metasiteId": "12345678" }',
        src: {
          backend: {},
          frontend: {},
          public: {},
          database: {}
        }
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
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`,
          JSON.stringify({})
        );

      await openEditorHandler({
        dir: tempDir
      });

      expect(
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status_text=success`
        )
      ).toBe(true);
    });
  });

  describe("when run in a directory without a config file", () => {
    test("should reject with an error explaining the issue", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({});

      return expect(
        openEditorHandler({
          dir: tempDir
        })
      ).rejects.toThrow(/Project not found in/);
    });
  });
});
