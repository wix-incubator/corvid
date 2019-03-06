const {socketActions} = require('@wix/wix-code-common')
const actions = require('./actions')
const handlerWrapper = (driver, requestPayload, doRequest, callback) => {
    try {
        const response = doRequest(driver, requestPayload)
        callback(null, response)
    } catch (e) {
        callback(e)
    }
}

module.exports = {
    [socketActions.DISCONNECT]: () => console.log('user disconnected'),
    [socketActions.IS_CLONE_MODE]: (driver, requestPayload, callback) => handlerWrapper(driver, requestPayload, actions.isCloneMode, callback),
    [socketActions.GET_DOCUMENT]: (driver, requestPayload, callback) => handlerWrapper(driver, requestPayload, actions.getDocument, callback),
    [socketActions.OVERRIDE_DOCUMENT]: (driver, requestPayload, callback) => handlerWrapper(driver, requestPayload, actions.overrideDocument, callback),
    [socketActions.GET_CODE]: (driver, requestPayload, callback) => handlerWrapper(driver, requestPayload, actions.getCode, callback),
    [socketActions.UPDATE_CODE]: (driver, requestPayload, callback) => handlerWrapper(driver, requestPayload, actions.updateCode, callback)
}