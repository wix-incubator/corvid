const path = require("path");
const http = require("http");
const stoppable = require("stoppable");
const express = require("express");
const browserify = require("browserify");
const listenOnFreePort = require("listen-on-free-port");

const bundle = browserify(path.resolve(path.join(__dirname, "browser.js")));

const runningServers = [];

function start() {
  const app = express();

  const editorRequestListeners = [];

  return new Promise((resolve, reject) => {
    bundle.bundle((err, code) => {
      if (err) reject(err);

      listenOnFreePort(3000, ["localhost"], () => {
        app.param("metasiteId", function(req, res, next, metasiteId) {
          req.metasiteId = metasiteId;
          next();
        });

        app.get("/editor.js", function(req, res) {
          res.send(code);
        });

        app.get("/editor/:metasiteId", function(req, res) {
          editorRequestListeners.forEach(listener => listener(req));
          res.sendFile(path.resolve(path.join(__dirname, "browser.html")));
        });

        return stoppable(http.createServer(app), 0);
      })
        .then(server => {
          runningServers.push(server);
          resolve({
            port: server.address().port,
            onEditorRequest: listener => editorRequestListeners.push(listener)
          });
        })
        .catch(reject);
    });
  });
}

module.exports = {
  start,
  killAllRunningServers: () => {
    return Promise.all(
      runningServers.splice(0).map(server => {
        return new Promise(resolve => server.close(resolve));
      })
    );
  }
};
