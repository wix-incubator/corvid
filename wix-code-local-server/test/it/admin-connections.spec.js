const eventually = require("@wix/wix-eventually");
const localServer = require("../../src/server");
const connectCli = require("../utils/fakeCli");
const { initLocalSite } = require("../utils/localSiteDir");

describe("admin connections", () => {
  it("should allow one admin to connect", async () => {
    const localSiteDir = await initLocalSite({});

    const server = await localServer.startInCloneMode(localSiteDir);
    const cli = await connectCli(server.adminPort);

    expect(cli.isConnected()).toBe(true);

    await cli.close();
    await server.close();
  });

  it("should block multiple connections", async () => {
    const localSiteDir = await initLocalSite({});
    const server = await localServer.startInCloneMode(localSiteDir);

    const cli1 = await connectCli(server.adminPort);
    await expect(connectCli(server.adminPort)).rejects.toThrow(
      "ONLY_ONE_CONNECTION_ALLOWED"
    );

    await cli1.close();
    await server.close();
  });

  it("should allow an admin to connect if a previously connected admin already closed", async () => {
    const localSiteDir = await initLocalSite({});
    const server = await localServer.startInCloneMode(localSiteDir);
    const cli1 = await connectCli(server.adminPort);

    await cli1.close();

    await eventually(async () => {
      const cli2 = await connectCli(server.adminPort);
      expect(cli2.isConnected()).toBe(true);
      await cli2.close();
    });

    await server.close();
  });
  // TODO: should reconnect when server reloads
});
