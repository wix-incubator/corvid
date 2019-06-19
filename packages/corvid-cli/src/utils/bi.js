/* global fetch */
require("isomorphic-fetch");
const getMessage = require("../messages");
const packageJson = require("../../package.json");

const biParams = {
  src: 39
};

const biUserAgent = getMessage("BI_User_Agent", {
  version: packageJson.version
});

function sendBiEvent(evid) {
  return async (msid, uuid, status = "start", additionalParams = {}) => {
    const eventParams = Object.assign(
      {},
      biParams,
      {
        evid,
        msid,
        uuid,
        csi: process.env.CORVID_SESSION_ID,
        status
      },
      additionalParams
    );
    const biUrlQueryString = Object.entries(eventParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetch(`http://frog.wix.com/code?${biUrlQueryString}`, {
      headers: { "User-Agent": biUserAgent }
    });
  };
}

const getBiContext = isHeadless =>
  Buffer.from(JSON.stringify({ builderEnv: "local", isHeadless })).toString(
    "base64"
  );

const getBiContextHeader = isHeadless =>
  `x-wix-bi-context: ${getBiContext(isHeadless)}`;

module.exports = {
  sendCloneEvent: sendBiEvent(200),
  sendOpenEditorEvent: sendBiEvent(201),
  sendPullEvent: sendBiEvent(202),
  getBiContext,
  getBiContextHeader
};
