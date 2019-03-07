const fetch = require("node-fetch");
const opn = require("opn");
const normalize = require("normalize-url");

const METASITE_REGEX = /<meta http-equiv="X-Wix-Meta-Site-Id" content="(.+?)"\/>/;

async function startLocalServer() {
  console.log("FAKE starting server on port 4567"); // eslint-disable-line no-console
  return 4567;
}

async function localModeEditorUrl(publicSiteUrl) {
  const siteHtml = await fetch(publicSiteUrl).then(res => res.text());
  const metasiteId = siteHtml.match(METASITE_REGEX)[1];
  return `https://www.wix.com/editor/${metasiteId}?localServerPort=4567`;
}

async function clone(args) {
  const publicSiteUrl = normalize(args.url);
  const serverPort = await startLocalServer();
  const editorUrl = await localModeEditorUrl(publicSiteUrl, serverPort);
  opn(editorUrl, { wait: false });
}

module.exports = {
  command: "clone <url>",
  describe: "clones the site and opens the editor",
  builder: args =>
    args.positional("url", {
      describe: "Public site URL",
      type: "string"
    }),
  handler: clone
};
