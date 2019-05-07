const { socketClient } = require("corvid-local-test-utils");
const { localServer, closeAll } = require("../utils/autoClosing");
const { initLocalSite } = require("../utils/localSiteDir");

const { version: localServerModuleVersion } = require("../../package.json");

afterEach(closeAll);

const getEditorEndpoint = server => `http://localhost:${server.port}`;
const getAdminEndpoint = server => `http://localhost:${server.adminPort}`;

const clientSocketOptions = {
  transportOptions: {
    polling: {
      extraHeaders: {
        origin: "https://editor.wix.com"
      }
    }
  }
};

describe("local server version", () => {
  it("should allow an editor to get the local server module version", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);

    const editorSocket = await socketClient.connect(
      getEditorEndpoint(server),
      clientSocketOptions
    );

    const version = await socketClient.sendRequest(
      editorSocket,
      "GET_SERVER_VERSION"
    );

    expect(version).toEqual(localServerModuleVersion);
  });

  it("should allow an admin to get the local server module version", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);

    const adminSocket = await socketClient.connect(getAdminEndpoint(server), {
      query: { token: server.adminToken }
    });
    const version = await socketClient.sendRequest(
      adminSocket,
      "GET_SERVER_VERSION"
    );

    expect(version).toEqual(localServerModuleVersion);
  });
});
