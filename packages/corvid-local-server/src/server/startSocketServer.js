const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const stoppable = require("stoppable");
const listenOnFreePort = require("listen-on-free-port");

const logger = require("corvid-local-logger");
const singleSocketConnectionMiddleware = require("./singleSocketConnectionMiddleware");

const setupSocketServer = async (defaultPort, options) => {
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
  if (options && options.allowedDomains) {
    io.origins((origin, callback) => {
      let hostname = origin.replace(/^https?:\/\//, "");
      if (!options.allowedDomains.includes(hostname)) {
        logger.warn(`refused origin [${origin}]`);
        return callback("origin not allowed", false);
      }
      logger.warn(`accepted origin [${origin}]`);
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
