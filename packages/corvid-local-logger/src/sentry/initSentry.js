const os = require("os");
const merge_ = require("lodash/merge");

const isSentryEnabled =
  process.env.ENABLE_SENTRY ||
  !["test", "development"].includes(process.env.NODE_ENV);

const initSentry = getSessionData => {
  const Sentry = require("@sentry/node");

  const prepareSessionData = () => {
    const {
      userId,
      metasiteId,
      command,
      editorVersion,
      santaVersion,
      release,
      sessionId
    } = getSessionData();

    return {
      user: { id: userId },
      tags: {
        command,
        "session-id": sessionId,
        os: os.type(),
        "metasite-id": metasiteId,
        "editor-version": editorVersion,
        "santa-version": santaVersion
      },
      release
    };
  };

  Sentry.init({
    dsn: "https://421920d4abe64d87bea03ac821e25ed6@sentry.io/1427669",
    environment: process.env.NODE_ENV,
    enabled: isSentryEnabled,
    beforeSend: event => merge_(prepareSessionData(), event)
  });

  return Sentry;
};

module.exports = initSentry;
