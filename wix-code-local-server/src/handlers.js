const {socketActions} = require('@wix/wix-code-common')
const actions = require('./actions')
module.exports = {
    [socketActions.disconnect]: () => console.log('user disconnected'),
    [socketActions.GET_VERSION]: (driver, resolve) => resolve(actions.getVersion()),
    [socketActions.IS_CLONE_MODE]: (driver, resolve) => resolve(actions.isCloneMode()),
    [socketActions.GET_DOCUMENT]: (driver, resolve) => resolve(actions.getDocument()),
    [socketActions.OVERRIDE_DOCUMENT]: (driver, data, resolve) => resolve(actions.overrideDocument(driver, data)),
    [socketActions.GET_CODE]: (driver, data, resolve) => resolve(actions.getCode(driver, data)),
    [socketActions.UPDATE_CODE]: (driver, data, resolve) => resolve(actions.updateCode(driver, data))
}