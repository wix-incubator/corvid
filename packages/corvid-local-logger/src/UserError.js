const ExtendableError = require("es6-error");

class UserError extends ExtendableError {
  constructor(...args) {
    super(...args);
  }
}

const isUserError = error =>
  error instanceof UserError ||
  (error instanceof Error && error.name === "UserError");

module.exports = UserError;
module.exports.isUserError = isUserError;
