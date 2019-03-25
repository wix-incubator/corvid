const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const stoppable = require("stoppable");
const listenOnFreePort = require("listen-on-free-port");

const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");

const setupSocketServer = async defaultPort => {
  const app = express();
  app.use(cors());
  const server = http.Server(app);
  const io = socketIo(server);
  io.use(singleSocketConnectionMiddleware());

  await listenOnFreePort(defaultPort, ["localhost"], () =>
    stoppable(server, 0)
  );

  return {
    close: () => {
      io.close();
      server.close();
    },
    port: server.address().port,
    io
  };
};

module.exports = setupSocketServer;
