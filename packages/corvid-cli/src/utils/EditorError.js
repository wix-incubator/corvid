const ExtendableError = require("es6-error");

class EditorError extends ExtendableError {
  constructor(...args) {
    super(...args);
  }
}

module.exports = EditorError;
