const path = require("path");
const winston = require("winston");
const initSentry = require("./initSentry");
const SentryTransport = require("./SentryTransport");

const LOG_FILE_PATH = path.join(".corvid", "session.log");

const logFileTransport = rootPath =>
  new winston.transports.File({
    level: process.env.LOG_LEVEL || "verbose",
    filename: path.join(rootPath, LOG_FILE_PATH),
    options: { flags: "w" },
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json()
    ),
    handleExceptions: true,
    handleRejections: true
  });

const crashConsoleTransport = () =>
  new winston.transports.Console({
    level: "error",
    format: winston.format.combine(
      winston.format.printf(
        () =>
          `[corvid] an error has occured. see [${LOG_FILE_PATH}] for details.`
      )
    ),
    handleExceptions: true,
    handleRejections: true
  });

const sentryTransport = sessionId =>
  new SentryTransport({
    sentry: initSentry(sessionId),
    level: "debug",
    handleExceptions: true,
    handleRejections: true
  });

const consoleTransport = () =>
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "warn",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.padLevels(),
      winston.format.colorize(),
      winston.format.printf(
        info => `[corvid] ${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    handleExceptions: true,
    handleRejections: true
  });

const initLogger = (sessionId, cwd) => {
  const logger = winston.createLogger({
    defaultMeta: { sessionId },
    transports: [
      logFileTransport(cwd),
      crashConsoleTransport(),
      sentryTransport(sessionId)
    ]
  });

  if (process.env.NODE_ENV === "development") {
    logger.add(consoleTransport());
  }

  return logger;
};

module.exports = initLogger;
