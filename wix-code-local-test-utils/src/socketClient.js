const io = require("socket.io-client");

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

const connect = async endpoint => {
  const connectedSocketPromise = new Promise((resolve, reject) => {
    const socket = io.connect(endpoint);

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

  return await connectedSocketPromise;
};

module.exports = {
  connect,
  sendRequest
};
