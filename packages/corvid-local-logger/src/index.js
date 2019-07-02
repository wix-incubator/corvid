const uuid = require("uuid");
const initLogger = require("./initLogger");
const UserError = require("./UserError");
const getCalledPackageId = require("./getCallerPackageId");

process.env.CORVID_SESSION_ID = process.env.CORVID_SESSION_ID || uuid.v4();
process.env.CORVID_CWD = process.env.CORVID_CWD || process.cwd();

const logger = initLogger(process.env.CORVID_CWD, {
  sessionId: process.env.CORVID_SESSION_ID,
  release: getCalledPackageId(module)
});

const logAsyncErrors = asyncCallback => async (...args) =>
  asyncCallback(...args).catch(error => {
    logger.error(error);
    throw error;
  });

process.on("uncaughtException", error => logger.error(error));
process.on("unhandledRejection", reason => logger.error(reason));

module.exports = logger;
module.exports.logger = logger;
module.exports.UserError = UserError;
module.exports.logAsyncErrors = logAsyncErrors;
module.exports.sentry = initLogger.sentry;
