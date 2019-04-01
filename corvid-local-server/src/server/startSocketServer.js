const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const stoppable = require("stoppable");
const listenOnFreePort = require("listen-on-free-port");

const debug = require("../debug");
const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");

const setupSocketServer = async defaultPort => {
  const app = express();
  app.use(cors());
  const server = http.Server(app);

  await listenOnFreePort(defaultPort, ["localhost"], () =>
    stoppable(server, 0)
  );

  const port = server.address().port;

  const io = socketIo(server);
  io.use(
    singleSocketConnectionMiddleware(() => {
      debug.log(`blocking multiple connection on port [${port}]`);
    })
  );

  return {
    close: () => {
      io.close();
      server.close();
    },
    port,
    io
  };
};

module.exports = setupSocketServer;
