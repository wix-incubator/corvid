const http = require("http");
const io = require("socket.io");
const listenOnFreePort = require("listen-on-free-port");
const localServer = require("@wix/wix-code-local-server/src/server");
const socketApi = require("@wix/wix-code-local-server/src/socketApi");

let serverHandler = () => {};

function startEditorListener() {
  return listenOnFreePort(
    3000,
    ["localhost"],
    http.createServer.bind(http)
  ).then(server => {
    const srv = io(server);

    socketApi(srv);

    return {
      server: srv,
      port: server.address().port,
      close: () => {
        return new Promise(resolve => {
          server.close(resolve);
        });
      }
    };
  });
}

const fakeSpawn = mode => localSite => {
  return listenOnFreePort(
    3000,
    ["localhost"],
    http.createServer.bind(http)
  ).then(async server => {
    const srv = io(server);

    if (typeof serverHandler === "function") {
      serverHandler(srv);
    }

    const editorListener = await startEditorListener(localSite);

    srv.on("connection", () => {
      srv.emit("status", {
        connected: false,
        mode,
        editorPort: editorListener.port
      });
    });

    editorListener.server.on("connection", () => {
      srv.emit("editor-connected", "");
    });

    return {
      server: srv,
      port: server.address().port,
      close: () => {
        return new Promise(resolve => {
          server.close(resolve);
        });
      }
    };
  });
};

function init() {
  localServer.startInCloneMode = fakeSpawn("clone");
  localServer.startInEditMode = fakeSpawn("edit");
}

function setServerHandler(handler) {
  serverHandler = handler;
}

module.exports = {
  init,
  setServerHandler
};
