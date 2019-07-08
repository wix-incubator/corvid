"use strict";

const fs = require("fs");
const path = require("path");

const { initTempDir } = require("corvid-local-test-utils");
const corvidLocalServerTestkit = require("corvid-local-server/src/testkit");
const localSiteDir = require("./utils/localSiteDir");

function initSite(siteItems) {
  return initTempDir(siteItems).then(function(localSite) {
    fs.writeFileSync(
      path.join(localSite, ".corvid", "corvidrc.json"),
      "",
      "utf8"
    );
    return Promise.resolve(localSite);
  });
}

const server = {
  startInEditMode: function(siteItems) {
    return corvidLocalServerTestkit.startInEditMode(siteItems);
  },
  startInCloneMode: function(siteItems) {
    return corvidLocalServerTestkit.startInCloneMode(siteItems);
  }
};

const localTestkit = {
  initSite,
  server,
  localSiteDir
};

module.exports = localTestkit;
