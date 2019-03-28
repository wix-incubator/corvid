const localServer = require("../../src/server");
const socketClient = require("@wix/wix-code-local-test-utils/src/socketClient");
const { initLocalSite } = require("../utils/localSiteDir");

const { version: localServerModuleVersion } = require("../../package.json");

const getEditorEndpoint = server => `http://localhost:${server.port}`;
const getAdminEndpoint = server => `http://localhost:${server.adminPort}`;

describe("local server version", () => {
  it("should allow an editor to get the local server module version", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);

    const editorSocket = await socketClient.connect(getEditorEndpoint(server));

    const version = await socketClient.sendRequest(
      editorSocket,
      "GET_SERVER_VERSION"
    );

    expect(version).toEqual(localServerModuleVersion);

    await server.close();
  });

  it("should allow an admin to get the local server module version", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);

    const adminSocket = await socketClient.connect(getAdminEndpoint(server));
    const version = await socketClient.sendRequest(
      adminSocket,
      "GET_SERVER_VERSION"
    );

    expect(version).toEqual(localServerModuleVersion);

    await server.close();
  });
});
