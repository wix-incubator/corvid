function genEditorUrl(useSsl, baseDomain, metasiteId, serverEditorPort) {
  const extraParams = process.env.QUERY ? `&${process.env.QUERY}` : "";
  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?petri_ovr=specs.ExcludeSiteFromSsr=true&experiments=se_wixCodeLocalMode&EditorSource=1.6043.0&ReactSource=1.6971.0&localServerPort=${serverEditorPort}${extraParams}`;
}

module.exports = genEditorUrl;
