/* eslint-disable no-console */
/* global fetch */
require("isomorphic-fetch");
const process = require("process");
const chalk = require("chalk");
const normalize = require("normalize-url");
const path = require("path");
const fs = require("fs");

const METASITE_REGEX = /<meta http-equiv="X-Wix-Meta-Site-Id" content="(.+?)"\/>/;
const SITE_NAME_REGEX = /<meta property="og:site_name" content="(.+?)"\/>/;

async function extractDataFromHtml(publicSiteUrl, ...regexList) {
  const siteHtml = await fetch(publicSiteUrl).then(res => res.text());
  return regexList.map(re => {
    const matches = siteHtml.match(re);
    if (matches && matches.length > 0) {
      return matches[1];
    } else {
      return null;
    }
  });
}

async function init(args) {
  const publicSiteUrl = normalize(args.url);
  const [metasiteId, siteName] = await extractDataFromHtml(
    publicSiteUrl,
    METASITE_REGEX,
    SITE_NAME_REGEX
  );

  if (metasiteId == null) {
    throw chalk.red(`Could not extract the metasite ID of ${publicSiteUrl}`);
  }

  if (siteName == null) {
    throw chalk.red(`Could not extract the site name of ${publicSiteUrl}`);
  }

  const dirName = path.resolve(path.join(args.dir || ".", siteName));

  if (dirName == null) {
    throw chalk.red("Could not extract site name, and no directory given");
  }

  try {
    fs.mkdirSync(dirName, { recursive: true, mode: 0o755 });
  } catch (exc) {
    if (exc.code !== "EEXIST") {
      throw chalk.red(`Error creating target directory ${dirName}`);
    }
  }

  const folderContents = fs.readdirSync(dirName);
  if (folderContents.length > 0 && !args.force) {
    if (folderContents.includes(".wixcoderc.json")) {
      throw chalk`{red Project already exists in ${dirName}}\nCancelling initialisation`;
    }

    throw chalk`{red Target directory ${dirName} is not empty}\nCancelling initialisation`;
  }

  process.stdout.write(chalk.grey(`Initialising workspace in ${dirName}...`));
  fs.writeFileSync(
    path.join(dirName, ".wixcoderc.json"),
    JSON.stringify({ metasiteId }, null, 2)
  );
  process.stdout.write(chalk.green("  Done.\n"));

  return dirName;
}

module.exports = init;
