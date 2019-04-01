const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "https://421920d4abe64d87bea03ac821e25ed6@sentry.io/1427669"
});

module.exports = Sentry;
