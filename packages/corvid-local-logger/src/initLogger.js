const path = require("path");
const winston = require("winston");
const initSentry = require("./initSentry");
const SentryTransport = require("./SentryTransport");
const UserError = require("./UserError");

const LOG_FILE_PATH = path.join(".corvid", "session.log");

const ALREADY_LOGGED = Symbol("already-logged");

const ignoreException = fn => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    console.error(e); /* eslint-disable-line no-console */
  }
};

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
    format: winston.format.printf(
      () =>
        `\n[corvid] an error has occured. see [${LOG_FILE_PATH}] for details.`
    )
  });

const sentryTransport = defaultMetadata =>
  new SentryTransport({
    sentry: initSentry(defaultMetadata),
    level: "debug"
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

const initLogger = (cwd, defaultMetadata) => {
  const logger = winston.createLogger({
    defaultMeta: defaultMetadata,
    transports: [
      logFileTransport(cwd),
      crashConsoleTransport(),
      sentryTransport(defaultMetadata)
    ]
  });

  if (process.env.NODE_ENV === "development") {
    logger.add(debugConsoleTransport());
  }

  const error = (info, ...args) => {
    if (info instanceof UserError) {
      return logger.info(info, ...args);
    }
    if (info instanceof Error) {
      if (info[ALREADY_LOGGED]) {
        return;
      }
      info[ALREADY_LOGGED] = true;
      return logger.error(info, { error: info }, ...args); // keep the original error object since winston destorys it
    }
    return logger.error(info, ...args);
  };

  return {
    error: ignoreException(error),
    warn: ignoreException(logger.warn.bind(logger)),
    info: ignoreException(logger.info.bind(logger)),
    verbose: ignoreException(logger.verbose.bind(logger)),
    debug: ignoreException(logger.debug.bind(logger)),
    silly: ignoreException(logger.silly.bind(logger)),

    close: () =>
      new Promise(resolve => {
        logger.on("finish", () => {
          logger.end();
          resolve();
        });
      })
  };
};

module.exports = initLogger;
