const io = require("socket.io-client");

const getAdminEndpoint = port => `http://localhost:${port}`;

const connectToLocalServer = port => {
  return new Promise((resolve, reject) => {
    const socket = io.connect(getAdminEndpoint(port));

    const rejectConnection = reason => {
      socket.removeAllListeners();
      reject(new Error(reason));
    };

    const resolveConnection = () => {
      socket.removeAllListeners();
      resolve(socket);
    };

    socket.once("error", rejectConnection);
    socket.once("connect_error", rejectConnection);
    socket.once("connect_timeout", rejectConnection);
    socket.once("disconnect", rejectConnection);

    socket.once("connect", resolveConnection);
  });
};

const sendRequest = async (socket, ...args) =>
  new Promise((resolve, reject) => {
    socket.emit(...args, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });

const connect = async port => {
  const adminSocket = await connectToLocalServer(port);

  return {
    isConnected: () => !!(adminSocket && adminSocket.connected),
    close: () => {
      if (adminSocket && adminSocket.connected) {
        adminSocket.disconnect();
      }
    },
    getServerStatus: async () => await sendRequest(adminSocket, "GET_STATUS")
  };
};

module.exports = connect;
