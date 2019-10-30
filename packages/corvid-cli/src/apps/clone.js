/* global fetch */
require("isomorphic-fetch");
const chalk = require("chalk");
const normalize = require("normalize-url");
const { URL } = require("url");
const getMessage = require("../messages");
const { logger, UserError } = require("corvid-local-logger");

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

function isInvalidUrl(url) {
  try {
    const normalizedUrl = normalize(url, { forceHttps: true });
    const parsedUrl = new URL(normalizedUrl);
    return !parsedUrl;
  } catch (e) {
    return true;
  }
}

async function extractSiteData(url, cookie) {
  const normalizedGivenUrl = normalize(url, { forceHttps: true });
  const parsedUrl = new URL(normalizedGivenUrl);
  const siteList = await getUserSiteList(cookie);
  logger.addExtraData({ userSiteList: siteList });

  if (parsedUrl.hostname === editorDomain) {
    const metasiteId = extractDataFromEditorUrl(parsedUrl);
    const site = siteList.find(site => site.metasiteId === metasiteId);

    return {
      metasiteId,
      siteName: site ? site.siteName : null,
      siteBelongsToUser: !!site
    };
  } else if (
    parsedUrl.hostname.endsWith(publicWixDomain) &&
    parsedUrl.pathname.startsWith(editorPath)
  ) {
    const metasiteId = extractDataFromPublicUrl(parsedUrl);
    const site = siteList.find(site => site.metasiteId === metasiteId);

    return {
      metasiteId,
      siteName: site ? site.siteName : null,
      siteBelongsToUser: !!site
    };
  } else {
    const site = siteList.find(
      site =>
        site.publicUrl &&
        (normalize(site.publicUrl, { forceHttps: true }) ===
          normalizedGivenUrl ||
          normalizedGivenUrl.startsWith(
            normalize(site.publicUrl, { forceHttps: true }) + "/"
          ))
    );

    return {
      metasiteId: site ? site.metasiteId : null,
      siteName: site ? site.siteName : null,
      siteBelongsToUser: !!site
    };
  }
}

async function clone(spinner, args, cookie) {
  spinner.start(chalk.grey(getMessage("Clone_Getting_Site_Data")));
  try {
    if (isInvalidUrl(args.url)) {
      throw new UserError(getMessage("Clone_Invalid_Url", { url: args.url }));
    }

    const { metasiteId, siteBelongsToUser } = await extractSiteData(
      args.url,
      cookie
    );

    if (metasiteId == null) {
      throw new UserError(
        getMessage("Clone_Non_Wix_Url_Or_No_Permissions", { url: args.url })
      );
    }

    if (!siteBelongsToUser) {
      throw new UserError(
        getMessage("Clone_Not_Owner_Error", { url: args.url })
      );
    }

    const msidUpdatePromise = sessionData.set({ msid: metasiteId });

    const dirName = args.dir;

    if (await doesConfigExist(dirName)) {
      throw new UserError(getMessage("Clone_Project_Exists_Error"));
    }

    await writeCorvidConfig(dirName, {
      metasiteId,
      cliVersion: packageJson.version
    });
    await spinner.start(chalk.grey(getMessage("Clone_Workspace_Initialized")));

    await msidUpdatePromise;
    return dirName;
  } catch (exc) {
    spinner.fail();
    throw exc;
  }
}

module.exports = clone;
