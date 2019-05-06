const { socketClient } = require("corvid-local-test-utils");

const getAdminEndpoint = adminPort => `http://localhost:${adminPort}`;

const startCli = async (adminPort, options = {}) => {
  const adminSocket = await socketClient.connect(
    getAdminEndpoint(adminPort),
    options
  );

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
