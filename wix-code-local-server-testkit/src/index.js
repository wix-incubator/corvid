const http = require("http");
const io = require("socket.io");
const listenOnFreePort = require("listen-on-free-port");
const localServer = require("@wix/wix-code-local-server/src/server");

const runningServers = [];

let serverHandler = () => {};

function init() {
  localServer.startInCloneMode = function fakeSpawn() {
    return listenOnFreePort(
      3000,
      ["localhost"],
      http.createServer.bind(http)
    ).then(server => {
      runningServers.push(server);
      const srv = io(server);

      if (typeof serverHandler === "function") {
        serverHandler(srv);
      }

      return {
        port: server.address().port,
        close: () => {
          return new Promise(resolve => {
            const indexOfServer = runningServers.indexOf(server);
            if (indexOfServer !== -1) {
              runningServers.splice(indexOfServer, 1);
            }
            server.close(resolve);
          });
        }
      };
    });
  };
}

function reset() {
  return Promise.all(
    runningServers.splice(0).map(server => {
      return new Promise(resolve => {
        server.close(resolve);
      });
    })
  );
}

function setServerHandler(handler) {
  serverHandler = handler;
}

module.exports = {
  init,
  reset,
  setServerHandler
};
