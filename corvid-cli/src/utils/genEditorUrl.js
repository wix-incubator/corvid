function genEditorUrl(
  useSsl,
  baseDomain,
  metasiteId,
  localServerPort,
  isHeadless,
  builderEnvironment
) {
  const extraParams = process.env.QUERY ? `&${process.env.QUERY}` : "";
  const skipEncodingParam = process.env.SKIP_LOCAL_MODE_ENCODING
    ? "&shouldSkipLocalModeEncoding=true"
    : "";

  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?petri_ovr=specs.ExcludeSiteFromSsr=true&corvidSessionId=${
    process.env.CORVID_SESSION_ID
  }${skipEncodingParam}&localServerPort=${localServerPort}&isHeadless=${isHeadless}&builderEnvironment=${builderEnvironment}${extraParams}`;
}

module.exports = genEditorUrl;
