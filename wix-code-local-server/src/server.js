 
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const getPort = require('get-port')
const _ = require('lodash')
const handlers = require('./handlers')
const { taskRunnerCreator } = require('./taskRunner')
const DEFAULT_PORT = 5000

module.exports.localServerCreator = async (basePath = './', isCloneMode = true) => {
    const app = express()
    app.use(cors())
    const server = http.Server(app)
    // todo:: change origins to wix.com
    const ioServer = socketIo(server).origins('*:*')
    let currentSocket = null
    const port = await getPort({port: DEFAULT_PORT})
    const requestTaskRunner = taskRunnerCreator()

    const localServerDriver = {
        getRequestTaskRunner: () => requestTaskRunner,
        destroy: () => {
            ioServer.close()
            server.close()
        },
        isCloneMode: () => isCloneMode,
        getPort: () => port,
        getBasePath: () => basePath
    }

    ioServer.sockets.on('connection', (socket) => {
        if (currentSocket && currentSocket.connected) {
            console.log("multiple connection!")
            socket.disconnect()
        }
        else {
            currentSocket = socket
            _.each(handlers, (handler, action) => currentSocket.on(action,  _.partial(handler, localServerDriver)))
            console.log('user connected!')
        } 
    })

    await new Promise((resolve, reject) => {
        server.listen(port,  () => {
            console.log(`Serving santa local pages on port ${port}!`)
            resolve()
        })
    })
    
    return localServerDriver
}
