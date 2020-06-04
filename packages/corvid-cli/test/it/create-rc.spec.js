const fetchMock = require("fetch-mock");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");
const sessionData = require("../../src/utils/sessionData");
const { killAllChildProcesses } = require("../../src/utils/electron");

jest.mock("../../src/commands/login");
const { createRc } = require("./cliDriver");
const setupMockedCreateRcSuccessResponse = async () => {
  fetchMock.mock(
    "https://editor.wix.com/html/editor/web/api/publish-rc/752363f1-e7f0-4c91-a095-1cba36e11d42?editorSessionId=18f12ed4-3c10-4cb7-abdb-14c5d0ed6a46&esi=18f12ed4-3c10-4cb7-abdb-14c5d0ed6a46&metaSiteId=5dc7ce18-892a-4cdc-8ff5-b916f1bf856b",
    JSON.stringify(
      [
        {
          errorCode: 0,
          errorDescription: "OK",
          success: true,
          payload: { revision: 1 }
        }
      ],
      null,
      2
    )
  );
};

describe("create-rc", () => {
  process.env.CORVID_SESSION_ID = "testCorvidId";
  let editorServer;

  const rcCallUrl =
    "https://editor.wix.com/html/editor/web/api/publish-rc/752363f1-e7f0-4c91-a095-1cba36e11d42?editorSessionId=bbaebee4-b871-475c-8339-3ad970b02280&esi=bbaebee4-b871-475c-8339-3ad970b02280&metaSiteId=5dc7ce18-892a-4cdc-8ff5-b916f1bf856b";
  const badRcCallUrl =
    "https://editor.wix.com/html/editor/web/api/publish-rc/112363f1-e7f0-4c91-a095-1cba36e11d42?editorSessionId=bbaebee4-b871-475c-8339-3ad970b02280&esi=bbaebee4-b871-475c-8339-3ad970b02280&metaSiteId=5dc7ce18-892a-4cdc-8ff5-b916f1bf856b";

  beforeEach(async () => {
    editorServer = await localFakeEditorServer.start();
    process.env.CORVID_CLI_WIX_DOMAIN = `localhost:${editorServer.port}`;
    process.env.DISABLE_SSL = true;
    await setupMockedCreateRcSuccessResponse();
  });

  afterEach(async () => {
    sessionData.reset();
    fetchMock.restore();
    await localFakeEditorServer.killAllRunningServers();
    await killAllChildProcesses();
  });

  describe("creating an RC from a cloned site", () => {
    test("should report to stdout with a success message when the process is complete", async () => {
      const createRcResponse = await createRc(rcCallUrl);
      return expect(createRcResponse).toMatch(
        /Release candidate created successfully/
      );
    });

    test("should report to stdout with a failure message when the process has failed due to bad credentials", async () => {
      const createRcResponse = await createRc(badRcCallUrl);
      return expect(createRcResponse).toMatch(
        /Release candidate could not be created due to bad credentials/
      );
    });
  });
});
