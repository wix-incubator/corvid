/* eslint-disable no-console */
/* global fetch */
require("isomorphic-fetch");
const process = require("process");
const chalk = require("chalk");
const normalize = require("normalize-url");
const path = require("path");
const fs = require("fs");

const METASITE_REGEX = /<meta http-equiv="X-Wix-Meta-Site-Id" content="(.+?)"\/>/;

async function extractMetasiteId(publicSiteUrl) {
  const siteHtml = await fetch(publicSiteUrl).then(res => res.text());
  const metasiteIdMatches = siteHtml.match(METASITE_REGEX);

  if (metasiteIdMatches && metasiteIdMatches.length > 0) {
    return metasiteIdMatches[1];
  }

  throw chalk.red(`Could not resolve Metasite ID of ${publicSiteUrl}`);
}

async function init(args) {
  const publicSiteUrl = normalize(args.url);
  const metasiteId = await extractMetasiteId(publicSiteUrl);

  try {
    fs.mkdirSync(args.dir, { recursive: true, mode: 0o755 });
  } catch (exc) {
    if (exc.code !== "EEXIST") {
      throw chalk.red(`Error creating target directory ${args.dir}`);
    }
  }

  const folderContents = fs.readdirSync(args.dir);
  if (folderContents.length > 0 && !args.force) {
    if (folderContents.includes(".wixcoderc.json")) {
      throw chalk`{red Project already exists in ${
        args.dir
      }}\nCancelling initialisation`;
    }

    throw chalk`{red Target directory ${
      args.dir
    } is not empty}\nCancelling initialisation`;
  }

  process.stdout.write(chalk.grey(`Initialising workspace in ${args.dir}...`));
  fs.writeFileSync(
    path.join(args.dir, ".wixcoderc.json"),
    JSON.stringify({ metasiteId }, null, 2)
  );
  process.stdout.write(chalk.green("  Done.\n"));
}

module.exports = init;
