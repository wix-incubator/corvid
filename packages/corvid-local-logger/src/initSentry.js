const os = require("os");

const initSentry = (defaultMetadata = {}) => {
  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: "https://421920d4abe64d87bea03ac821e25ed6@sentry.io/1427669",
    defaultIntegrations: [],
    release: defaultMetadata.release,
    environment: process.env.NODE_ENV,
    enabled: !["test", "development"].includes(process.env.NODE_ENV)
  });

  Sentry.configureScope(scope => {
    scope.setTags({
      session_id: defaultMetadata.sessionId,
      os: os.type()
    });
    scope.setExtras(defaultMetadata);
  });

  return Sentry;
};

module.exports = initSentry;
