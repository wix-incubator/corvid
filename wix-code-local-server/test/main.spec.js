const io = require('socket.io-client');
const eventually = require('@wix/wix-eventually')
const LocalServer = require('../src/server');

const LOCAL_SERVER_PORT = 3333
const LOCAL_SERVER_URL = `http://localhost:${LOCAL_SERVER_PORT}`;

let server
let socket
beforeAll((done) => {
  server = new LocalServer(LOCAL_SERVER_PORT, {version: 8})
  server.initIOEvents()
  server.start()
  done()
})

afterAll(async (done) => {
  server.close()
  done()
})



beforeEach((done) => {
  socket = io.connect(LOCAL_SERVER_URL, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  })
  socket.on('connect', () => {
    done()
  })
})

afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect()
  }
  done()
})

//todo:: handle multiple sockets to one server, 
describe('local server', () => {
  it("should connect to socket", () => {
    expect(socket.connected).toBe(true)
  })
  it("should return local server version", (done) => {
    socket.emit('GET_VERSION', (version) => {
      expect(version).toBe(8)
      done()
    })
  })
  it("should return local server status (isCloned <=> edit mode)", (done) => {
    socket.emit('SHOULD_LOAD_OR_CLONE_SITE', (isCloned) => {
      expect(isCloned).toBe(true)
      done()
    })
  })
  it("should not connect new socket if old one is still connected", async () => {
    // something strange here
    const socket2 = io.connect(LOCAL_SERVER_URL, {
      'reconnection delay': 0,
      'reopen delay': 0,
      transports: ['websocket'],
    })
    await eventually(() => {
      expect(socket2.connected).toBe(false)
      expect(socket.connected).toBe(true)
      socket2.disconnect()
    })
  })
  // it("should return local server documents (pages and renderedModel)", ()=> {
  //     expect("test").toBe("test")
  // })
  // it("should update local server documents", ()=> {
  //     expect("test").toBe("test")
  // })
  // it("should return local server code files", ()=> {
  //     expect("test").toBe("test")
  // })
  // it("should apply code changes", ()=> {
  //     expect("test").toBe("test")
  // })
  // it("should notify on changes of site files via socket", ()=> {
  //     expect("test").toBe("test")
  // })
})