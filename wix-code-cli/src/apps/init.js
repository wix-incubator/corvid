/* eslint-disable no-console */
/* global fetch */
require("isomorphic-fetch");
const normalize = require("normalize-url");
const path = require("path");
const fs = require("fs");
const Result = require("folktale/Result");

const METASITE_REGEX = /<meta http-equiv="X-Wix-Meta-Site-Id" content="(.+?)"\/>/;

async function extractMetasiteId(publicSiteUrl) {
  const siteHtml = await fetch(publicSiteUrl).then(res => res.text());
  const metasiteIdMatches = siteHtml.match(METASITE_REGEX);

  if (metasiteIdMatches.length > 0) {
    return Result.Ok(metasiteIdMatches[1]);
  }

  return Result.Error([
    -1,
    `Could not resolve Metasite ID of ${publicSiteUrl}`
  ]);
}

async function init(args) {
  const publicSiteUrl = normalize(args.url);
  const metasiteIdResult = await extractMetasiteId(publicSiteUrl);

  return metasiteIdResult.chain(metasiteId => {
    try {
      fs.mkdirSync(args.dir, { recursive: true, mode: 0o755 });
    } catch (exc) {
      if (exc.code !== "EEXIST") {
        return Result.Error([
          exc.errno,
          `error creating target directory ${args.dir}`
        ]);
      }
    }

    if (fs.readdirSync(args.dir).length > 0) {
      return Result.Error([-1, `target directory ${args.dir} is not empty`]);
    }

    console.log(`initialising project in ${args.dir}`);
    fs.writeFileSync(
      path.join(args.dir, ".wixcoderc.json"),
      JSON.stringify({ metasiteId }, null, 2)
    );
    return Result.Ok();
  });
}

module.exports = init;
