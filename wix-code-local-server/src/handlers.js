const socketActions = require("./socketActions");
const actions = require("./actions");
const handlerWrapper = (
  localServerDriver,
  requestPayload,
  doRequest,
  callback
) => {
  return async done => {
    try {
      const response = await doRequest(localServerDriver, requestPayload);
      callback(null, response);
    } catch (e) {
      callback(e.message);
    } finally {
      done();
    }
  };
};

module.exports = {
  [socketActions.IS_CLONE_MODE]: (
    localServerDriver,
    requestPayload,
    callback
  ) =>
    localServerDriver
      .getRequestTaskRunner()
      .push(
        handlerWrapper(
          localServerDriver,
          requestPayload,
          actions.isCloneMode,
          callback
        )
      ),
  [socketActions.GET_DOCUMENT]: (localServerDriver, requestPayload, callback) =>
    localServerDriver
      .getRequestTaskRunner()
      .push(
        handlerWrapper(
          localServerDriver,
          requestPayload,
          actions.getDocument,
          callback
        )
      ),
  [socketActions.OVERRIDE_DOCUMENT]: (
    localServerDriver,
    requestPayload,
    callback
  ) =>
    localServerDriver
      .getRequestTaskRunner()
      .push(
        handlerWrapper(
          localServerDriver,
          requestPayload,
          actions.overrideDocument,
          callback
        )
      ),
  [socketActions.GET_CODE]: (localServerDriver, requestPayload, callback) =>
    localServerDriver
      .getRequestTaskRunner()
      .push(
        handlerWrapper(
          localServerDriver,
          requestPayload,
          actions.getCode,
          callback
        )
      ),
  [socketActions.UPDATE_CODE]: (localServerDriver, requestPayload, callback) =>
    localServerDriver
      .getRequestTaskRunner()
      .push(
        handlerWrapper(
          localServerDriver,
          requestPayload,
          actions.updateCode,
          callback
        )
      )
};
