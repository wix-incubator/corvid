function genEditorUrl(useSsl, baseDomain, metasiteId, serverEditorPort) {
  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?petri_ovr=specs.ExcludeSiteFromSsr=true&experiments=se_wixCodeLocalMode&localServerPort=${serverEditorPort}`;
}

module.exports = genEditorUrl;
