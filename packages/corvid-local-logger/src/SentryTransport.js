const Sentry = require("@sentry/node");
const Transport = require("winston-transport");

const WINSTON_TO_SENTRY_LEVEL = {
  error: "error",
  warn: "warning",
  info: "info",
  verbose: "info",
  debug: "debug",
  silly: "debug"
};

class SentryTransport extends Transport {
  constructor(opts) {
    super(opts);
    this._sentry = opts.sentry;
    this._sillyLogs = [];
  }

  _captureException(error) {
    this._sentry.withScope(scope => {
      scope.setExtra("sillyLogs", this._sillyLogs);
      this._sentry.captureException(error);
    });
    this._sillyLogs = [];
  }

  _captureEvent(event) {
    this._sentry.withScope(scope => {
      scope.setExtra("sillyLogs", this._sillyLogs);
      this._sentry.captureEvent(event);
    });
    this._sillyLogs = [];
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    if (info instanceof Error) {
      this._captureException(info);
    } else if (info.message instanceof Error) {
      this._captureException(info.message);
    } else if (info.error instanceof Error) {
      this._captureException(info.error);
    } else if (info.level === "error") {
      const { message, ...metadata } = info;
      this._captureEvent({
        message,
        level: Sentry.Severity.Error,
        extra: { metadata }
      });
    } else if (info.level === "silly") {
      this._sillyLogs.push({ timestamp: Date.now(), ...info });
    } else {
      const { message, level, ...metadata } = info;
      this._sentry.addBreadcrumb({
        message,
        level: WINSTON_TO_SENTRY_LEVEL[level],
        data: metadata
      });
      callback();
      return;
    }

    this._sentry.flush().then(() => callback());
  }
}

module.exports = SentryTransport;
