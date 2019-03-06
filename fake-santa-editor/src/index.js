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

const wrapCalbback = (callback) => (
    (error, responsePayload) => {
        if (error) throw new Error(error)
        callback(responsePayload)
    }
)
const emit = (socket, requestType, payload, callback) => socket.emit(requestType, payload, wrapCalbback(callback))
const close = (socket) => {
    if(socket && socket.connected) {
        socket.disconnect()
    }
}

// fake editor operations
const isCloneMode = (socket, callback) => emit(socket, socketActions.IS_CLONE_MODE, undefined, callback)
const getDocument = (socket, callback) => emit(socket, socketActions.GET_DOCUMENT, undefined, callback)
const overrideDocument = (socket, data, callback) => emit(socket, socketActions.OVERRIDE_DOCUMENT, data, callback)
const getCode = (socket, callback) => emit(socket, socketActions.GET_CODE, undefined, callback)
const updateCode = (socket, data, callback) => emit(socket, socketActions.UPDATE_CODE, data, callback)

module.exports.fakeEditorCreator = async (siteData, port) => {
    const socket = await connectToLocalServer(port)
    let document = siteData.document || {}
    let code = siteData.code || {}

    socket.on(socketActions.UPDATE_CODE, (codeChanges) => {
        codeFiles = Object.assign(codeFiles, codeChanges)
    })

    // fake operations
    const save = (callback = {document: undefined, code: undefined}) => {
        overrideDocument(socket, document, callback.document)
        updateCode(socket, code, callback.code)
    }

    // editor is nofitied when a user changes code and documents

    return _.mapValues({
        isConnected,
        isCloneMode,
        close,
        getDocument,
        getCode,
        save,
        publish: () => {},
        modifyDocument: (newDocument) => Object.assign(document, newDocument),
        modifyCode: (newCode) => Object.assign(codeFiles, newCode)
    }, (fn) => _.partial(fn, socket))
}
