const http = require('http')
const io = require('socket.io')
const listenOnFreePort = require('listen-on-free-port')
const localServer = require('@wix/wix-code-local-server')

const runningServers = []

let serverHandler = () => {}

function fakeLocalServer() {
  localServer.spawn = function fakeSpawn() {
    return listenOnFreePort(
      3000,
      ['localhost'],
      http.createServer.bind(http)
    ).then(server => {
      runningServers.push(server)
      const srv = io(server)

      if (typeof serverHandler === 'function') {
        serverHandler(srv)
      }

      return server.address().port
    })
  }
}

function killAllRunningServers() {
  return Promise.all(
    runningServers.splice(0).map(server => {
      return new Promise(resolve => {
        server.close(resolve)
      })
    })
  )
}

function setServerHandler(handler) {
  serverHandler = handler
}

module.exports = {
  init: fakeLocalServer,
  reset: killAllRunningServers,
  setServerHandler
}
