const ExtendableError = require("es6-error");

class EditorError extends ExtendableError {
  constructor(message, userMessage) {
    super(message);
    this.userMessage = userMessage;
  }
}

const isEditorError = error =>
  error instanceof EditorError ||
  (error instanceof Error && error.name === "EditorError");

module.exports = EditorError;
module.exports.isEditorError = isEditorError;
