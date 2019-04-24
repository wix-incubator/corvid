const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const stoppable = require("stoppable");
const listenOnFreePort = require("listen-on-free-port");

const logger = require("corvid-local-logger");
const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");

const setupSocketServer = async (defaultPort, origin) => {
  const app = express();
  const server = http.Server(app);

  await listenOnFreePort(defaultPort, ["localhost"], () =>
    stoppable(server, 0)
  );

  const port = server.address().port;

  const io = socketIo(server);
  io.use(
    singleSocketConnectionMiddleware(() => {
      logger.warn(`blocking multiple connection on port [${port}]`);
    })
  );
  if (origin) {
    io.origins((o, callback) => {
      if (origin !== new URL(o).hostname) {
        logger.warn(`refused origin [${o}]`);
        return callback("origin not allowed", false);
      }
      logger.warn(`accepted origin [${o}]`);
      callback(null, true);
    });
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
