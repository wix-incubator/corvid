const eventually = require("wix-eventually");
const {
  fakeCli: connectCli,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { initLocalSite } = require("../utils/localSiteDir");
const token = "test_token";
const adminSocketOptions = {
  query: { token }
};

afterEach(closeAll);

describe("admin connections", () => {
  it("should allow one admin to connect", async () => {
    const localSiteDir = await initLocalSite();

    const server = await localServer.startInCloneMode(localSiteDir, { token });
    const cli = await connectCli(server.adminPort, adminSocketOptions);

    expect(cli.isConnected()).toBe(true);
  });

  it("should block multiple connections", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir, { token });

    await connectCli(server.adminPort, adminSocketOptions);
    await expect(
      connectCli(server.adminPort, adminSocketOptions)
    ).rejects.toThrow("ONLY_ONE_CONNECTION_ALLOWED");
  });

  it("should allow an admin to connect if a previously connected admin already closed", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir, { token });
    const cli1 = await connectCli(server.adminPort, adminSocketOptions);

    await cli1.close();

    await eventually(async () => {
      const cli2 = await connectCli(server.adminPort, adminSocketOptions);
      expect(cli2.isConnected()).toBe(true);
    });
  });
  // TODO: should reconnect when server reloads
});
