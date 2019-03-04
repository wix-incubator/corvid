const io = require('socket.io-client');
const _ = require('lodash');
const {socketActions} = require('@wix/wix-code-common')
const getLocalServerURL = (port) => `http://localhost:${port}`

const connectToLocalServer = (port) => {
    return new Promise((resolve, reject) => {
        const url = getLocalServerURL(port)
        socket = io.connect(getLocalServerURL(port), {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': false,
            transports: ['websocket'],
        })
        socket.on('connect', () => {
            resolve(socket)
        })
    })
}

const isConnected = (socket) => !! _.get(socket, 'connected')
const getVersion = (socket, callback) => socket.emit('GET_VERSION', callback)
const isCloneMode = (socket, callback) => socket.emit(socketActions.IS_CLONE_MODE, callback)
const getDocument = (socket, callback) => socket.emit(socketActions.GET_DOCUMENT, callback)
const overrideDocument = (socket, data, callback) => socket.emit(socketActions.OVERRIDE_DOCUMENT, data, callback)
const getCode = (socket, callback) => socket.emit(socketActions.GET_CODE, callback)
const updateCode = (socket, data, callback) => socket.emit(socketActions.UPDATE_CODE, data, callback)
const close = (socket) => {
    if(socket && socket.connected) {
        socket.disconnect()
    }
}

module.exports.fakeEditorCreator = async (siteData, port) => {
    const socket = await connectToLocalServer(port)
    const document = {}
    let codeFiles = {}

    socket.on(socketActions.UPDATE_CODE, (codeChanges) => {
        codeFiles = Object.assign(codeFiles, codeChanges)
    })

    // editor is nofitied when a user changes code and documents

    return _.mapValues({
        isConnected,
        close,
        getDocument,
        getCodeFiles: () => {
            return codeFiles
        },
        save: () => {
            socket.emit('UPDATE_DOCUMENTS', data, callback)
            socket.emit('UPDATE_CODE')
        },
        modifyDocument: (newDocument) => Object.assign(document, newDocument),
        modifyCode: (type, codeChanges) => Object.assign(codeFiles, codeChanges)
    }, (fn) => _.partial(fn, socket))
}
