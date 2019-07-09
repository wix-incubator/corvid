const ExtendableError = require("es6-error");

class EditorError extends ExtendableError {
  constructor(message, userMessage) {
    super(message);
    this.userMessage = userMessage;
  }
}

module.exports = EditorError;
