const os = require("os");

const initSentry = sessionId => {
  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: "https://421920d4abe64d87bea03ac821e25ed6@sentry.io/1427669",
    defaultIntegrations: [],
    enabled: process.env.NODE_ENV === "production"
  });

  Sentry.configureScope(scope => {
    scope.setTags({
      session_id: sessionId,
      os: os.type()
    });
  });

  return Sentry;
};

module.exports = initSentry;
