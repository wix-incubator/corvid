"use strict";

var fs = require("fs");
var path = require("path");

var { initTempDir } = require("corvid-local-test-utils");
var corvidLocalServerTestkit = require("corvid-local-server/src/testkit");

var localSiteDir = require("./localSiteDir");

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

var server = {
  startInEditMode: function(siteItems) {
    return corvidLocalServerTestkit.startInEditMode(siteItems);
  },
  startInCloneMode: function(siteItems) {
    return corvidLocalServerTestkit.startInCloneMode(siteItems);
  }
};

var localTestkit = {
  localSiteDir,
  initSite,
  server
};

module.exports = localTestkit;
