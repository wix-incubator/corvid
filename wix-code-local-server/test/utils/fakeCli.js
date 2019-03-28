const socketClient = require("@wix/wix-code-local-test-utils/src/socketClient");

const getAdminEndpoint = adminPort => `http://localhost:${adminPort}`;

const startCli = async adminPort => {
  const adminSocket = await socketClient.connect(getAdminEndpoint(adminPort));

  return {
    isConnected: () => !!(adminSocket && adminSocket.connected),
    close: () => adminSocket.disconnect(),
    getServerStatus: async () =>
      await socketClient.sendRequest(adminSocket, "GET_STATUS"),
    onServerEvent: (event, callback) => {
      adminSocket.on(event, callback);
    }
  };
};

module.exports = startCli;
