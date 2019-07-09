const Sentry = require("@sentry/node");
const Transport = require("winston-transport");

const WINSTON_TO_SENTRY_LEVEL = {
  error: Sentry.Severity.Error,
  warn: Sentry.Severity.Warning,
  info: Sentry.Severity.Info,
  verbose: Sentry.Severity.Info,
  debug: Sentry.Severity.Debug
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

    if (info.level === "error" || info.level === "warn") {
      const errorObject =
        info._error instanceof Error
          ? info._error
          : info instanceof Error
          ? info
          : null;

      if (errorObject) {
        this._captureException(errorObject, {
          level: WINSTON_TO_SENTRY_LEVEL[info.level],
          extra: { info }
        });
      } else {
        const { message, level, ...metadata } = info;
        this._captureEvent({
          message,
          level: WINSTON_TO_SENTRY_LEVEL[level],
          extra: { metadata }
        });
      }
    } else if (info.level === "silly") {
      this._sillyLogs.push({ timestamp: Date.now(), ...info });
    } else {
      const { message, level, ...metadata } = info;
      this._sentry.addBreadcrumb({
        message,
        level: WINSTON_TO_SENTRY_LEVEL[level],
        data: metadata
      });
    }

    this._sentry.flush().then(() => callback());
  }
}

module.exports = SentryTransport;
