const os = require("os");
const merge_ = require("lodash/merge");

const initSentry = (defaultMetadata = {}, getSessionData) => {
  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: "https://421920d4abe64d87bea03ac821e25ed6@sentry.io/1427669",
    defaultIntegrations: [],
    release: defaultMetadata.release,
    environment: process.env.NODE_ENV,
    enabled: !["test", "development"].includes(process.env.NODE_ENV),
    beforeSend: event => merge_(getSessionData(), event)
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
