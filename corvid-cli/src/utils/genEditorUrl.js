function genEditorUrl(useSsl, baseDomain, metasiteId, serverEditorPort) {
  const extraParams = process.env.QUERY ? `&${process.env.QUERY}` : "";
  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?petri_ovr=specs.ExcludeSiteFromSsr=true&experiments=se_corvidLocalMode&localServerPort=${serverEditorPort}${extraParams}`;
}

module.exports = genEditorUrl;
