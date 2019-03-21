async function sendRequest(socket, ...args) {
  return new Promise((resolve, reject) => {
    socket.emit(...args, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  sendRequest
};
