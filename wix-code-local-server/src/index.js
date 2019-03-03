const LocalServer = require('./server')
const server = new LocalServer()
server.initIOEvents()
server.start()