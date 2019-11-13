const ExtendableError = require("es6-error");

class ParseError extends ExtendableError {
  constructor(err, path) {
    super(err.message);
    this.name = "ParseError";
    this.path = path;
    this.stack = err.stack;
  }
}

const isParseError = error => error instanceof ParseError;

module.exports = ParseError;
module.exports.isParseError = isParseError;
