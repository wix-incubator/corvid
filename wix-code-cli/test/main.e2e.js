const childProcess = require('child_process')
const process = require('process')
const path = require('path')
const localServerTestKit = require('@wix/wix-code-local-server-testkit')
const localFakeEditor = require('@wix/fake-local-mode-editor')

describe('main flow', () => {
  beforeAll(() => {
    process.env.WIXCODE_CLI_HEADLESS = true
    localServerTestKit.init()
  })

  afterEach(() => {
    localFakeEditor.close()
    return localServerTestKit.killAllRunningServers()
  })

  describe('clone', () => {
    it('should open browser with correct URL', () => {
      expect.assertions(1)

      const localEditorPort = localFakeEditor.start()
      process.env.WIXCODE_CLI_WIX_DOMAIN = `localhost:${localEditorPort}`

      const onConnectionHandler = jest.mockFn()

      localServerTestKit.setServerHandler(sio => {
        sio.on('connection', onConnectionHandler)
      })

      childProcess.spawn(
        path.resolve(path.join(__dirname, '..', 'src', 'index'), ['clone'])
      )
      expect(onConnectionHandler).toBeCalledOnce()
    })

    it('should connect', () => {
      // expect(true).toBe(false)
    })

    it('should download site files', () => {
      // expect(true).toBe(false)
    })

    it('should watch local site files', () => {
      // expect(true).toBe(false)
    })
  })
  describe('edit', () => {
    it('should connect', () => {
      // expect(true).toBe(false)
    })

    it('should upload site files', () => {
      // expect(true).toBe(false)
    })

    it('should watch local site files', () => {
      // expect(true).toBe(false)
    })
  })
})
