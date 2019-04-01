/* global fetch */
require("isomorphic-fetch");
const process = require("process");
const chalk = require("chalk");
const normalize = require("normalize-url");
const path = require("path");
const fs = require("fs");
const { writeWixCodeConfig } = require("../utils/wix-code-config");

const editorDomain = "editor.wix.com";
const publicWixDomain = "wix.com";
const editorPath = "/editor/";
const editorUrlMetasiteIdParam = "metaSiteId";
const userSiteListApi =
  "https://www.wix.com/_api/wix-code-devex-service/v1/listUserSites";

async function getUserSiteList(cookie) {
  return await fetch(userSiteListApi, {
    headers: { cookie: `${cookie.name}=${cookie.value};` }
  }).then(res => res.json());
}

function extractDataFromEditorUrl(parsedUrl) {
  const metasiteId = parsedUrl.searchParams.get(editorUrlMetasiteIdParam);

  return metasiteId;
}

function extractDataFromPublicUrl(parsedUrl) {
  const metasiteId = parsedUrl.pathname.split("/")[2];

  return metasiteId;
}

async function extractMetasiteIdAndName(url, cookie) {
  const publicSiteOrEditorUrl = normalize(url, { forceHttps: true });
  const parsedUrl = new URL(publicSiteOrEditorUrl);
  const siteList = await getUserSiteList(cookie);

  if (parsedUrl.hostname === editorDomain) {
    const metasiteId = extractDataFromEditorUrl(parsedUrl);
    const site = siteList.find(site => site.metasiteId === metasiteId);

    return { metasiteId, siteName: site ? site.siteName : null };
  } else if (
    parsedUrl.hostname.endsWith(publicWixDomain) &&
    parsedUrl.pathname.startsWith(editorPath)
  ) {
    const metasiteId = extractDataFromPublicUrl(parsedUrl);
    const site = siteList.find(site => site.metasiteId === metasiteId);

    return { metasiteId, siteName: site ? site.siteName : null };
  } else {
    const site = siteList.find(
      site =>
        site.publicUrl &&
        normalize(site.publicUrl, { forceHttps: true }) ===
          publicSiteOrEditorUrl
    );

    return {
      metasiteId: site ? site.metasiteId : null,
      siteName: site ? site.siteName : null
    };
  }
}

async function init(args, cookie) {
  const { metasiteId, siteName } = await extractMetasiteIdAndName(
    args.url,
    cookie
  );

  if (metasiteId == null) {
    throw chalk.red(`Could not extract the metasite ID of ${args.url}`);
  }

  if (siteName == null) {
    throw chalk.red(`Could not extract the site name of ${args.url}`);
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
  writeWixCodeConfig(dirName, { metasiteId });
  process.stdout.write(chalk.green("  Done.\n"));

  return dirName;
}

module.exports = init;
