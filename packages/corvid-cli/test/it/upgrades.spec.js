const fetchMock = require("fetch-mock");
const chalk = require("chalk");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { localSiteDir } = require("corvid-local-test-utils");
const { UserError } = require("corvid-local-logger");
const {
  server: localFakeEditorServer
} = require("corvid-fake-local-mode-editor");
const sessionData = require("../../src/utils/sessionData");
const { killAllChildProcesses } = require("../../src/utils/electron");

jest.mock("../../src/commands/login");
const { openEditor } = require("./cliDriver");

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

  describe("when run in a directory with a local version of the site", () => {
    const mockFailingOpenEditorBI = () => {
      fetchMock
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=start`,
          JSON.stringify({})
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=201&msid=12345&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }&status=fail`,
          JSON.stringify({})
        );
    };

    it("should fail to loading in edit mode on a project with local file system version 1.0", async () => {
      const localSiteFiles = localSiteBuilder.buildFull();
      const rootSitePath = await localSiteDir.initLocalSite(localSiteFiles);

      const currentMetadata = JSON.parse(
        await localSiteDir.readFile(rootSitePath, ".metadata.json")
      );

      const oldMetadata = Object.assign({}, currentMetadata, {
        localFileSystemLayout: "1.0"
      });

      await localSiteDir.writeFile(
        rootSitePath,
        ".metadata.json",
        JSON.stringify(oldMetadata)
      );

      mockFailingOpenEditorBI();

      await expect(openEditor(rootSitePath)).rejects.toThrow(
        new UserError(
          chalk.red(
            'Your local site project was created using an older version of the Corvid CLI. You cannot use this version with your current project.\n\nTo work with the new Corvid CLI:\n1. Run "npm install --save-dev corvid-cli@0.1.83" to reinstall the version used to create your project.\n2. Run "npx corvid open-editor" to open the Local Editor.\n3. Click Push in the Local Editor to push your changes to the Wix remote repository.\n4. Close the Local Editor.\n5. Run "npm install --save-dev corvid-cli@latest" to install the latest version of the Corvid CLI.\n6. Run "npx corvid pull --override" to pull your site using the new CLI.\n7. Your local project is now set up to work with the new CLI.'
          )
        )
      );
    });
  });
});
