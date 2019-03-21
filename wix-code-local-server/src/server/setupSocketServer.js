const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const stoppable = require("stoppable");
const listenOnFreePort = require("listen-on-free-port");

const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");

function setupSocketServer() {
  const app = express();
  app.use(cors());
  const server = http.Server(app);
  const io = socketIo(server);
  io.use(singleSocketConnectionMiddleware());

  return {
    listen: async defaultPort =>
      listenOnFreePort(defaultPort, ["localhost"], () =>
        stoppable(server, 0)
      ).then(server => server.address().port),
    close: () => {
      io.close();
      server.close();
    },
    io
  };
}

module.exports = setupSocketServer;
