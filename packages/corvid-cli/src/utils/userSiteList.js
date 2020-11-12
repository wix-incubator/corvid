/* global fetch */
require("isomorphic-fetch");

const metaSiteSearchUrl = "https://www.wix.com/meta-site-search-web/v2/search";

const getUserSiteList = async cookie => {
  const headers = {
    cookie: `${cookie.name}=${cookie.value};`,
    "content-type": "application/json",
    accept: "application/json"
  };

  const body = {
    responseData: {
      paths: ["name", "viewer_url"]
    },
    paging: {
      pageSize: 1000
    }
  };

  const response = await fetch(metaSiteSearchUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const { entries } = await response.json();
  return entries.map(({ name, metaSiteId, viewerUrl }) => ({
    metasiteId: metaSiteId,
    siteName: name,
    viewerUrl
  }));
};

module.exports.getUserSiteList = getUserSiteList;
