const uuid = require("uuid");
const initLogger = require("./initLogger");
const UserError = require("./UserError");
const getCallerPackageId = require("./getCallerPackageId");

process.env.CORVID_SESSION_ID = process.env.CORVID_SESSION_ID || uuid.v4();
process.env.CORVID_CWD = process.env.CORVID_CWD || process.cwd();

const logger = initLogger(process.env.CORVID_CWD);
logger.addSessionData({
  sessionId: process.env.CORVID_SESSION_ID,
  release: getCallerPackageId(module)
});

const logAsyncErrors = asyncCallback => async (...args) =>
  asyncCallback(...args).catch(error => {
    if (!UserError.isUserError(error)) {
      logger.error(error);
    }
    throw error;
  });

process.on("uncaughtException", error => {
  if (!UserError.isUserError(error)) {
    logger.error(error, { origin: "uncaughtException" });
  }
});
process.on("unhandledRejection", reason => {
  if (!UserError.isUserError(reason)) {
    logger.error(reason, { origin: "unhandledRejection" });
  }
});

module.exports = logger;
module.exports.logger = logger;
module.exports.UserError = UserError;
module.exports.logAsyncErrors = logAsyncErrors;
