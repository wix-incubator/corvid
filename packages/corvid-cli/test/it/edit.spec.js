const fetchMock = require("fetch-mock");
const eventually = require("wix-eventually");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { initTempDir } = require("corvid-local-test-utils");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");
const sessionData = require("../../src/utils/sessionData");
const { killAllChildProcesses } = require("../../src/utils/electron");

jest.mock("../../src/commands/login");
const { openEditor } = require("./cliDriver");
const base64 = require("../utils/base64");

describe("edit", () => {
  process.env.CORVID_SESSION_ID = "testCorvidId";
  process.env.CORVID_FORCE_HEADLESS = 1;

  let editorServer;
  beforeEach(async () => {
    editorServer = await localFakeEditorServer.start();
    process.env.CORVID_CLI_WIX_DOMAIN = `localhost:${editorServer.port}`;
    process.env.DISABLE_SSL = true;
  });

  afterEach(async () => {
    sessionData.reset();
    fetchMock.restore();
    await localFakeEditorServer.killAllRunningServers();
    await killAllChildProcesses();
  });

  const openEditorAndWaitTillItLoads = tempDir => {
    const editorLoadedPromise = new Promise(resolve => {
      editorServer.onEditorLoaded(resolve);
    });

    openEditor(tempDir);

    return editorLoadedPromise;
  };

  describe("when run in a directory with a local version of the site", () => {
    const setupSuccessfullOpenEditor = async () => {
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
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      return tempDir;
    };

    test("should open the editor with the local server port", async () => {
      const localSiteFiles = localSiteBuilder.buildFull();
      const tempDir = await initTempDir(
        Object.assign(
          {
            ".corvid": { "corvidrc.json": '{ "metasiteId": "12345678" }' }
          },
          { src: localSiteFiles }
        )
      );

      await openEditorAndWaitTillItLoads(tempDir);
    });

    test("should report to BI an open-editor start event", async () => {
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
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await openEditorAndWaitTillItLoads(tempDir);

      await eventually(() => {
        expect(
          fetchMock.called(
            `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=start`
          )
        ).toBe(true);
      });
    });

    test("should report to BI an open-editor success event", async () => {
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
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=success`,
          JSON.stringify({})
        );

      await openEditorAndWaitTillItLoads(tempDir);

      await eventually(() => {
        expect(
          fetchMock.called(
            `http://frog.wix.com/code?src=39&evid=201&msid=12345678&uuid=testGuid&csi=${
              process.env.CORVID_SESSION_ID
            }&status=success`
          )
        ).toBe(true);
      });
    });

    describe("bi context", () => {
      const expectedOpenEditorBiContext = JSON.stringify({
        builderEnv: "local",
        isHeadless: false
      });

      test("should open the editor with the correct bi context query parameter", async () => {
        const tempDir = await setupSuccessfullOpenEditor();

        const biContextQueryPromise = new Promise(resolve => {
          editorServer.onEditorRequest(req => {
            resolve(req.query["x-wix-bi-context"]);
          });
        });

        await openEditorAndWaitTillItLoads(tempDir);

        const biContextQueryValue = await biContextQueryPromise;

        expect(base64.decode(biContextQueryValue)).toEqual(
          expectedOpenEditorBiContext
        );
      });

      test("should open the editor with the correct bi context header ", async () => {
        const tempDir = await setupSuccessfullOpenEditor();

        const biContextHeaderPromise = new Promise(resolve => {
          editorServer.onEditorRequest(req => {
            resolve(req.get("x-wix-bi-context"));
          });
        });

        await openEditorAndWaitTillItLoads(tempDir);

        const biContextHeaderValue = await biContextHeaderPromise;

        expect(base64.decode(biContextHeaderValue)).toEqual(
          expectedOpenEditorBiContext
        );
      });
    });
  });

  describe("when run in a directory without a config file", () => {
    test("should reject with an error explaining the issue", async () => {
      expect.assertions(1);
      const tempDir = await initTempDir({});

      return expect(openEditor(tempDir)).rejects.toThrow(
        /Project not found in/
      );
    });
  });
});
