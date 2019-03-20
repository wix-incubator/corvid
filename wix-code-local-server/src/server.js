const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const getPort = require("get-port");
const initLocalSiteManager = require("@wix/wix-code-local-site");

const initSocketHandler = require("./socketApi");

const DEFAULT_PORT = 5000;

function setupServer() {
  const app = express();
  app.use(cors());
  const server = http.Server(app);
  const io = socketIo(server).origins("*:*");
  return { server, io };
}

function blockMultipleConnections() {
  let connections = 0;
  return (socket, next) => {
    if (connections > 0) {
      return next(new Error("ONLY_ONE_CONNECTION_ALLOWED"));
    }
    connections++;
    socket.on("disconnect", () => {
      connections--;
    });
    return next();
  };
}

async function startServer(siteRootPath, isCloneMode) {
  const { server, io } = setupServer();
  // TODO:: add src folder to path ?
  const localSite = await initLocalSiteManager(siteRootPath);

  if (isCloneMode && !(await localSite.isEmpty())) {
    localSite.close();
    throw new Error("CAN_NOT_CLONE_NON_EMPTY_SITE");
  }

  if (!isCloneMode && (await localSite.isEmpty())) {
    localSite.close();
    throw new Error("CAN_NOT_EDIT_EMPTY_SITE");
  }

  const socketHandler = initSocketHandler(localSite);

  io.use(blockMultipleConnections());
  io.on("connection", socket => socketHandler(socket));

  const port = await getPort({ port: DEFAULT_PORT });
  await new Promise(resolve => server.listen(port, resolve));

  return {
    port,
    close: () => {
      localSite.close();
      io.close();
      server.close();
    }
  };
}

const startInCloneMode = siteRootPath => startServer(siteRootPath, true);

const startInEditMode = siteRootPath => startServer(siteRootPath, false);

module.exports = {
  startInCloneMode,
  startInEditMode
};
