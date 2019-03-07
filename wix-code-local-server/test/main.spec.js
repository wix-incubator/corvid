const eventually = require('@wix/wix-eventually')
const {localServerCreator} = require('../src/server')
const {fakeEditorCreator} = require('@wix/fake-santa-editor')

let server
// todo:: should add test that handle errors
describe('local server', () => {
    describe('general operations', async () => {
        beforeAll(async (done) => {
            server = await localServerCreator()
            done()
        })
        afterAll(() => {
            server.destroy()
        })
        it("should connect to socket", async () => {
            const fakeEditor = await fakeEditorCreator({}, server.getPort())
            expect(fakeEditor.isConnected()).toBe(true)
            fakeEditor.close()
        })
          it("should not connect new socket if old one is still connected", async done => {
            const fakeEditor1 = await fakeEditorCreator({}, server.getPort())
            const fakeEditor2 = await fakeEditorCreator({}, server.getPort())
            await eventually(() => {
              expect(fakeEditor1.isConnected()).toBe(true)
              expect(fakeEditor2.isConnected()).toBe(false)
            })
            fakeEditor1.close()
            fakeEditor2.close()
            done()
        })
    })
    describe('is in clone mode', async () => {
        beforeAll(async (done) => {
            server = await localServerCreator()
            done()
        })
        afterAll(() => {
            server.destroy()
        })
        it('should responsed true when when editor sending message isCloneMode', async done => {
            const fakeEditor = await fakeEditorCreator({}, server.getPort())
            fakeEditor.isCloneMode(responsePayload => {
                expect(responsePayload).toEqual(true)
                fakeEditor.close()
                done()
            })
        })
    })
    describe('is in edit mode', async () => {
        beforeAll(async (done) => {
            server = await localServerCreator('./', false)
            done()
        })
        afterAll(() => {
            server.destroy()
        })
        it('should responsed false when when editor sending message isCloneMode', async done => {
            const fakeEditor = await fakeEditorCreator({}, server.getPort())
            fakeEditor.isCloneMode(responsePayload => {
                expect(responsePayload).toEqual(false)
                fakeEditor.close()
                done()
            })
        })
    }) 
})
