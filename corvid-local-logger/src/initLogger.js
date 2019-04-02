const winston = require("winston");
const initSentry = require("./initSentry");
const SentryTransport = require("./SentryTransport");

const logFileName = sessionId => `.logs/corvid-${sessionId}.log`;

const logFileTransport = sessionId =>
  new winston.transports.File({
    level: process.env.LOG_LEVEL || "info",
    filename: logFileName(sessionId),
    defaultMeta: { sessionId },
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json()
    ),
    handleExceptions: true,
    handleRejections: true
  });

const crashConsoleTransport = sessionId =>
  new winston.transports.Console({
    level: "error",
    format: winston.format.combine(
      winston.format.printf(
        () =>
          `[corvid] an error has occured. see [${logFileName(
            sessionId
          )}] for details.`
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

const initLogger = sessionId => {
  const logger = winston.createLogger({
    transports: [
      logFileTransport(sessionId),
      crashConsoleTransport(sessionId),
      sentryTransport(sessionId)
    ]
  });

  if (process.env.NODE_ENV === "development") {
    logger.add(consoleTransport());
  }

  return logger;
};

module.exports = initLogger;
