const os = require("os");
const merge_ = require("lodash/merge");
const set_ = require("lodash/set");
let sessionData = {};

const initSentry = (defaultMetadata = {}) => {
  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: "https://421920d4abe64d87bea03ac821e25ed6@sentry.io/1427669",
    defaultIntegrations: [],
    release: defaultMetadata.release,
    environment: process.env.NODE_ENV,
    enabled: !["test", "development"].includes(process.env.NODE_ENV),
    beforeSend: event => merge_(sessionData, event)
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

const updateSessionData = (path, value) => set_(sessionData, path, value);

const setExtraData = (key, value) => updateSessionData(["extra", key], value);
const setTag = (tag, value) => updateSessionData(["tags", tag], value);
const setUserId = userGuid => updateSessionData("user", { id: userGuid });

module.exports = initSentry;
module.exports.setExtraData = setExtraData;
module.exports.setTag = setTag;
module.exports.setUserId = setUserId;
