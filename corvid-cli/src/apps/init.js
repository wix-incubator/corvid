/* global fetch */
require("isomorphic-fetch");
const chalk = require("chalk");
const normalize = require("normalize-url");
const {
  writeCorvidConfig,
  doesConfigExist
} = require("../utils/corvid-config");
const sessionData = require("../utils/sessionData");
const packageJson = require("../../package.json");

const editorDomain = "editor.wix.com";
const publicWixDomain = "wix.com";
const editorPath = "/editor/";
const editorUrlMetasiteIdParam = "metaSiteId";
const userSiteListApi =
  "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites";

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

async function init(spinner, args, cookie) {
  spinner.start(chalk.grey("Getting site information"));
  try {
    const { metasiteId } = await extractMetasiteIdAndName(args.url, cookie);

    if (metasiteId == null) {
      throw new Error(`Could not get site information from ${args.url}`);
    }
    const msidUpdatePromise = sessionData.set({ msid: metasiteId });

    const dirName = args.dir;

    if (await doesConfigExist(dirName)) {
      throw new Error(`Project already exists`);
    }

    await writeCorvidConfig(dirName, {
      metasiteId,
      cliVersion: packageJson.version
    });
    await spinner.start(chalk.grey(`Initialised workspace`));

    await msidUpdatePromise;
    return dirName;
  } catch (exc) {
    spinner.fail();
    throw exc;
  }
}

module.exports = init;
