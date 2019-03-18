function genEditorUrl(useSsl, baseDomain, metasiteId, serverEditorPort) {
  return `${
    useSsl ? "https" : "http"
  }://${baseDomain}/editor/${metasiteId}?localServerPort=${serverEditorPort}`;
}

module.exports = genEditorUrl;
