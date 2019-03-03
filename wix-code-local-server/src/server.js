 
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const _ = require('lodash')
const handlers = require('./handlers')
const defaultOptions = {version: 1, basePath: ''}

module.exports = class LocalServer {
    constructor(port = 5000, options = defaultOptions) {
        const app = express()
        app.use(cors())
        this.server = http.Server(app)
        this.port = port
        this.version = options.version
        // todo:: change origins to wix.com
        this.ioServer = socketIo(this.server).origins('*:*')
    }
    initIOEvents() {
        this.ioServer.sockets.on('connection', (socket) => {
            console.log('user connected')
            if (this.socket && this.socket.connected){
                console.log("multiple connection!")
                socket.disconnect()
            } else {
                this.socket = socket
                _.each(handlers, (handler, action) => {
                    socket.on(action, handler.bind(this))
                })
            } 
        })
    }
    start() {
        this.server.listen(this.port,  () => {
            console.log(`Serving santa local pages on port ${this.port}!`)
        })
    }
    getVersion() {
        console.log(`version: ${this.version}`)
        return this.version
    }
    isCloned() {
        //todo
        return true
    }
    async close() {
        await this.ioServer.close()
        await this.server.close()
        console.log('after server close')
    }
}
