module.exports = {
  isCloneMode(localServerDriver) {
    // can be an async operation as well
    return new Promise(reslove => {
      reslove(localServerDriver.isCloneMode());
    });
  },
  getDocument(/*localServerDriver, data*/) {
    //todo
    console.log("getDocument"); // eslint-disable-line no-console
    return {};
  },
  overrideDocument(localServerDriver, data) {
    //todo
    console.log("overrideDocument"); // eslint-disable-line no-console
    return data;
  },
  getCode(/*localServerDriver, data*/) {
    //todo
    console.log("getCode"); // eslint-disable-line no-console
    return {};
  },
  updateCode(localServerDriver, data) {
    //todo
    console.log("updateCode"); // eslint-disable-line no-console
    return data;
  }
};
