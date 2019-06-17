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
        status_text: status
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

function getBiContextHeader(isVisible) {
  const data = { builderEnv: "local", isHeadless: !isVisible };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
  return `x-wix-bi-context: ${encoded}`;
}

module.exports = {
  sendCloneEvent: sendBiEvent(200),
  sendOpenEditorEvent: sendBiEvent(201),
  sendPullEvent: sendBiEvent(202),
  getBiContextHeader
};
