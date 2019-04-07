/* global fetch */
require("isomorphic-fetch");
const chalk = require("chalk");
const normalize = require("normalize-url");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { writeCorvidConfig } = require("../utils/corvid-config");
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

function parseSessionCookie(cookie) {
  try {
    const cookieData = jwt.decode(cookie.value.slice(4)).data;
    const parsedSession = JSON.parse(cookieData);
    return parsedSession;
  } catch (_) {
    return {};
  }
}

async function init(spinner, args, cookie) {
  spinner.start(chalk.grey("Getting site information"));
  try {
    const { metasiteId, siteName } = await extractMetasiteIdAndName(
      args.url,
      cookie
    );

    if (metasiteId == null) {
      throw new Error(`Could not extract the metasite ID of ${args.url}`);
    }
    fetch(
      `http://frog.wix.com/code?src=39&evid=200&msid=${metasiteId}&uuid=${
        parseSessionCookie(cookie).userGuid
      }&csi=${process.env.CORVID_SESSION_ID}`,
      { headers: { "User-Agent": `Corvid CLI v${packageJson.version}` } }
    );

    if (siteName == null) {
      throw new Error(`Could not extract the site name of ${args.url}`);
    }

    const dirName = path.resolve(path.join(args.dir || ".", siteName));

    if (dirName == null) {
      throw new Error("Could not extract site name, and no directory given");
    }

    spinner.start(chalk.grey(`Initialising workspace in ${dirName}`));
    try {
      fs.mkdirSync(dirName, { recursive: true, mode: 0o755 });
    } catch (exc) {
      if (exc.code !== "EEXIST") {
        throw new Error(`Error creating target directory ${dirName}`);
      }
    }

    const folderContents = fs.readdirSync(dirName);
    if (folderContents.length > 0 && !args.force) {
      if (folderContents.includes(".corvidrc.json")) {
        throw new Error(`Project already exists in ${dirName}`);
      }

      if (folderContents.some(item => !item.startsWith("."))) {
        throw new Error(`Target directory ${dirName} is not empty`);
      }
    }

    await writeCorvidConfig(dirName, {
      metasiteId,
      cliVersion: packageJson.version
    });
    await spinner.start(chalk.grey(`Initialised workspace in ${dirName}`));

    return dirName;
  } catch (exc) {
    spinner.fail();
    throw exc;
  }
}

module.exports = init;
