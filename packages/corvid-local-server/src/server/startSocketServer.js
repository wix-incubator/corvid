/* eslint-disable no-console */
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const stoppable = require("stoppable");
const listenOnFreePort = require("listen-on-free-port");
const getMessage = require("../messages");

const logger = require("corvid-local-logger");
const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");
const originsMiddleware = require("./originsMiddleWare");

const setupSocketServer = async (defaultPort, options = {}) => {
  const app = express();
  const server = http.Server(app);

  await listenOnFreePort(defaultPort, ["localhost"], () =>
    stoppable(server, 0)
  );

  const port = server.address().port;
  console.log("now listening on port", port);

  const io = socketIo(server);
  io.use(
    singleSocketConnectionMiddleware(() => {
      logger.warn(
        getMessage("StartSocketServer_Multiple_Connections_Log", { port })
      );
    })
  );
  if (options.allowedDomains) {
    io.use(originsMiddleware(options.allowedDomains));
  }

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
