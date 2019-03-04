const {socketActions} = require('@wix/wix-code-common')
const actions = require('./actions')
module.exports = {
    [socketActions.disconnect]: () => console.log('user disconnected'),
    [socketActions.GET_VERSION]: resolve => resolve(actions.getVersion()),
    [socketActions.IS_CLONE_MODE]: resolve => resolve(actions.isCloneMode()),
    [socketActions.GET_DOCUMENT]: resolve => resolve(actions.getDocument()),
    [socketActions.OVERRIDE_DOCUMENT]: (data, resolve) => resolve(actions.overrideDocument(data)),
    [socketActions.GET_CODE]: (data, resolve) => resolve(actions.getCode()),
    [socketActions.UPDATE_CODE]: (data, resolve) => resolve(actions.updateCode())
}