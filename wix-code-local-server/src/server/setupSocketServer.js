const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const getPort = require("get-port");

const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");

function setupSocketServer() {
  const app = express();
  app.use(cors());
  const server = http.Server(app);
  const io = socketIo(server);
  io.use(singleSocketConnectionMiddleware());

  return {
    listen: async defaultPort => {
      const freePort = await getPort({ port: defaultPort });
      new Promise(resolve => server.listen(freePort, resolve));
      return freePort;
    },
    close: () => {
      io.close();
      server.close();
    },
    io
  };
}

module.exports = setupSocketServer;
