const Sentry = require("@sentry/node");
const Transport = require("winston-transport");
const UserError = require("../UserError");

const WINSTON_TO_SENTRY_LEVEL = {
  error: Sentry.Severity.Error,
  warn: Sentry.Severity.Warning,
  info: Sentry.Severity.Info,
  verbose: Sentry.Severity.Info,
  debug: Sentry.Severity.Debug
};

const convertLevel = ({ level, ...rest }) =>
  level ? { level: WINSTON_TO_SENTRY_LEVEL[level], ...rest } : rest;

class SentryTransport extends Transport {
  constructor(opts) {
    super(opts);
    this._sentry = opts.sentry;
    this._sillyLogs = [];
  }

  _captureException(error, { level = "error", extra }) {
    this._sentry.withScope(scope => {
      scope.setLevel(WINSTON_TO_SENTRY_LEVEL[level]);
      scope.setExtras({ ...extra, sillyLogs: this._sillyLogs });
      this._sentry.captureException(error);
    });
    this._sillyLogs = [];
  }

  _captureEvent(event) {
    this._sentry.withScope(scope => {
      scope.setExtra("sillyLogs", this._sillyLogs);
      this._sentry.captureEvent(convertLevel(event));
    });
    this._sillyLogs = [];
  }

  _addBreadcrumb(breadcrumb) {
    this._sentry.configureScope(scope => {
      scope.addBreadcrumb(convertLevel(breadcrumb));
    });
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const { message, level, ...extra } = info;

    if (level === "error" || level === "warn") {
      if (message instanceof Error) {
        if (message instanceof UserError) {
          this._addBreadcrumb({
            message: message.message,
            category: "UserError",
            level,
            data: {
              stack: message.stack,
              ...extra
            }
          });
        } else {
          this._captureException(message, {
            level,
            extra
          });
        }
      } else {
        this._captureEvent({
          message,
          level,
          extra
        });
      }
    } else if (level === "silly") {
      this._sillyLogs.push({
        timestamp: Date.now(),
        message,
        level,
        extra
      });
    } else {
      this._addBreadcrumb({
        message,
        level,
        data: extra
      });
    }

    this._sentry.flush().then(() => callback());
  }
}

module.exports = SentryTransport;
