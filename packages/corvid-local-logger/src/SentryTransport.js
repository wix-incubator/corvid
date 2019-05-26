const Sentry = require("@sentry/node");
const Transport = require("winston-transport");

class SentryTransport extends Transport {
  constructor(opts) {
    super(opts);
    this._sentry = opts.sentry;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    if (info instanceof Error) {
      this._sentry.captureException(info);
    } else if (info.message instanceof Error) {
      this._sentry.captureException(info.message);
    } else if (info.error instanceof Error) {
      this._sentry.captureException(info.error);
    } else if (info.level === "error") {
      const { message, ...metadata } = info;
      this._sentry.captureEvent({
        message,
        level: Sentry.Severity.Error,
        extra: { metadata }
      });
    } else {
      this._sentry.addBreadcrumb({
        message: info.message,
        category: info.level
      });
      callback();
      return;
    }

    this._sentry.flush().then(() => callback());
  }
}

module.exports = SentryTransport;
