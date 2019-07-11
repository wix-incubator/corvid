const path = require("path");
const winston = require("winston");
const defaults_ = require("lodash/defaults");
const initSentry = require("./sentry/initSentry");
const SentryTransport = require("./sentry/SentryTransport");
const UserError = require("./UserError");

const LOG_FILE_PATH = path.join(".corvid", "session.log");

const IS_DEV_ENVIRONMENT = process.env.NODE_ENV === "development";

const logFileTransport = rootPath =>
  new winston.transports.File({
    level: process.env.LOG_LEVEL || "verbose",
    filename: path.join(rootPath, LOG_FILE_PATH),
    options: { flags: "w" },
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json()
    )
  });

const crashConsoleTransport = () =>
  new winston.transports.Console({
    level: "error",
    format: winston.format.printf(info =>
      info.message instanceof UserError
        ? ""
        : `\n[corvid] an error has occured. see [${LOG_FILE_PATH}] for details.`
    )
  });

const sentryTransport = sentry =>
  new SentryTransport({
    sentry,
    level: "silly"
  });

const debugConsoleTransport = () =>
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "debug",
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.padLevels(),
      winston.format.colorize(),
      winston.format.printf(
        info => `[corvid] ${info.timestamp} ${info.level}: ${info.message}`
      )
    )
  });

const addSessionData = ({
  userId,
  metasiteId,
  command,
  editorVersion,
  santaVersion,
  release,
  sessionId
}) => {
  const sessionData = {
    userId,
    metasiteId,
    command,
    editorVersion,
    santaVersion,
    release,
    sessionId
  };
  process.env.CORVID_LOCAL_LOGGER_SESSION_DATA = JSON.stringify(
    defaults_(sessionData, getSessionData())
  );
};

const getSessionData = () =>
  JSON.parse(process.env.CORVID_LOCAL_LOGGER_SESSION_DATA || "{}");

const initLogger = cwd => {
  const sentry = initSentry(getSessionData);

  const logger = winston.createLogger({
    transports: [
      logFileTransport(cwd),
      crashConsoleTransport(),
      sentryTransport(sentry)
    ]
  });

  if (IS_DEV_ENVIRONMENT) {
    logger.add(debugConsoleTransport());
  }

  const handleErrors = winstonLoggerCallback => (
    infoOrError,
    errorMetadata
  ) => {
    if (infoOrError instanceof Error) {
      return winstonLoggerCallback(
        Object.assign({}, errorMetadata, { message: infoOrError })
      );
    } else {
      return winstonLoggerCallback(infoOrError);
    }
  };

  logger.on("error", err => {
    if (IS_DEV_ENVIRONMENT) {
      console.log("Logger error", err); // eslint-disable-line no-console
    }
  });

  return {
    error: handleErrors(logger.error.bind(logger)),
    warn: handleErrors(logger.warn.bind(logger)),
    info: handleErrors(logger.info.bind(logger)),
    verbose: handleErrors(logger.verbose.bind(logger)),
    debug: handleErrors(logger.debug.bind(logger)),
    silly: handleErrors(logger.silly.bind(logger)),

    addSessionData,
    addExtraData: extraData => {
      sentry.configureScope(scope => {
        scope.setExtras(extraData);
      });
    },

    close: () =>
      new Promise(resolve => {
        logger.on("finish", resolve);
        logger.end();
      })
  };
};

module.exports = initLogger;
