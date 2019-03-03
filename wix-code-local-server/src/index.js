 
const express = require('express')
const http = require('http')
const port = 5000
const app = express()
const server = http.Server(app)

server.listen(port, function () {
    console.log(`Serving santa local pages on port ${port}!`)
})