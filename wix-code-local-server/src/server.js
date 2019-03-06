 
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const getPort = require('get-port')
const _ = require('lodash')
const handlers = require('./handlers')
const DEFAULT_PORT = 5000

module.exports.localServerCreator = async (basePath = './') => {
    const app = express()
    app.use(cors())
    const server = http.Server(app)
    // todo:: change origins to wix.com
    const ioServer = socketIo(server).origins('*:*')
    let currentSocket = null
    const port = await getPort({port: DEFAULT_PORT})

    const serverDriver = {
        destroy: () => {
            ioServer.close()
            server.close()
            console.log('after server close')
        },
        getPort: () => port,
        getBasePath: () => basePath
    }

    ioServer.sockets.on('connection', (socket) => {
        console.log('user connected')
        if (currentSocket && currentSocket.connected){
            console.log("multiple connection!")
            socket.disconnect()
        } else {
            currentSocket = socket
            // TODO: handle requests one by one (put them in a queue)
            _.each(handlers, (handler, action) => currentSocket.on(action,  _.partial(handler, serverDriver)))
        } 
    })

    await new Promise((resolve, reject) => {
        server.listen(port,  () => {
            console.log(`Serving santa local pages on port ${port}!`)
            resolve()
        })
    })
    
    return serverDriver
}
