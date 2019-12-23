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
        "os-version": os.release(),
        "metasite-id": metasiteId,
        "editor-version": editorVersion,
        "santa-version": santaVersion
      },
      release
    };
  };

  Sentry.init({
    dsn: "https://bfe720fa180147689b8cd8b64a300902@sentry.wixpress.com/162",
    environment: process.env.NODE_ENV,
    enabled: isSentryEnabled,
    beforeSend: event => merge_(prepareSessionData(), event)
  });

  return Sentry;
};

module.exports = initSentry;
