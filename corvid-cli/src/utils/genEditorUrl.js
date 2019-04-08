function genEditorUrl(
  useSsl,
  baseDomain,
  metasiteId,
  localServerPort,
  isHeadless,
  builderEnvironment
) {
  const extraParams = process.env.QUERY ? `&${process.env.QUERY}` : "";
  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?petri_ovr=specs.ExcludeSiteFromSsr=true&corvidSessionId=${
    process.env.CORVID_SESSION_ID
  }&localServerPort=${localServerPort}&isHeadless=${isHeadless}&builderEnvironment=${builderEnvironment}${extraParams}`;
}

module.exports = genEditorUrl;
