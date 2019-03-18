/* eslint-disable no-console */
const fetch = require("isomorphic-fetch");
const normalize = require("normalize-url");
const path = require("path");
const fs = require("fs");

const METASITE_REGEX = /<meta http-equiv="X-Wix-Meta-Site-Id" content="(.+?)"\/>/;

async function extractMetasiteId(publicSiteUrl) {
  const siteHtml = await fetch(publicSiteUrl).then(res => res.text());
  const metasiteIdMatches = siteHtml.match(METASITE_REGEX);

  if (metasiteIdMatches.length > 0) return metasiteIdMatches[1];

  throw new Error(`Could not resolve Metasite ID of ${publicSiteUrl}`);
}

async function init(args) {
  const publicSiteUrl = normalize(args.url);
  const metasiteId = await extractMetasiteId(publicSiteUrl);

  try {
    fs.mkdirSync(args.dir, { recursive: true, mode: 0o755 });
  } catch (exc) {
    if (exc.code !== "EEXIST") {
      console.error(`error creating target directory ${args.dir}`);
      process.exit(exc.errno);
    }
  }

  if (fs.readdirSync(args.dir).length > 0) {
    console.error(`target directory ${args.dir} is not empty`);
    process.exit(-1);
  }

  console.log(`initialising project in ${args.dir}`);
  fs.writeFileSync(
    path.join(args.dir, ".wixcoderc.json"),
    JSON.stringify({ metasiteId }, null, 2)
  );
}

module.exports = {
  command: "init <url> <dir>",
  describe: "intialises a local Wix Code copy",
  builder: args =>
    args
      .positional("url", { describe: "Public site URL", type: "string" })
      .positional("dir", {
        describe: "local directory to download data to",
        type: "string"
      }),
  handler: init
};
