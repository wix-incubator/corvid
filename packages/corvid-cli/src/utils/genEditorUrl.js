const { getBiContext } = require("./bi");

function genEditorUrl(useSsl, metasiteId, localServerPort, isHeadless) {
  const extraParams = process.env.QUERY ? `&${process.env.QUERY}` : "";
  const skipEncodingParam = process.env.SKIP_LOCAL_MODE_ENCODING
    ? "&shouldSkipLocalModeEncoding=true"
    : "";

  const baseDomain = process.env.CORVID_CLI_WIX_DOMAIN || "www.wix.com";

  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?experimentsoff=se_excludeLocalModeBolt&petri_ovr=specs.ExcludeSiteFromSsr=true&corvidSessionId=${
    process.env.CORVID_SESSION_ID
  }${skipEncodingParam}&localServerPort=${localServerPort}&x-wix-bi-context=${getBiContext(
    isHeadless
  )}${extraParams}`;
}

module.exports = genEditorUrl;
