const { localSiteDir } = require("corvid-local-test-utils");
const { localServer, closeAll } = require("../utils/autoClosing");
const { localSiteBuilder } = require("corvid-local-site/testkit");
const { UserError } = require("corvid-local-logger");

afterEach(closeAll);

describe("Upgrades", () => {
  it("should fail to loading in edit mode on a project with an old file system layout", async () => {
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

    const startServerResponse = localServer.startInEditMode(rootSitePath);

    await expect(startServerResponse).rejects.toThrow(
      new UserError("OLD_FILE_SYSTEM_LAYOUT_NOT_SUPPORTED")
    );
  });
});
