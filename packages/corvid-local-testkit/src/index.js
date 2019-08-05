"use strict";
const tmp = require("tmp");
const { localSiteDir } = require("corvid-local-test-utils");

const tempDir = tmp.dirSync();
process.env.CORVID_CWD = tempDir.name;
process.env.ENABLE_SENTRY = false;

const corvidLocalServerTestkit = require("corvid-local-server/src/testkit");

const LOCAL_SITE_PATH = Symbol.for("local-site-path");

const server = {
  startInEditMode: localSite => {
    return corvidLocalServerTestkit.startInEditMode(localSite[LOCAL_SITE_PATH]);
  },
  startInCloneMode: localSite => {
    return corvidLocalServerTestkit.startInCloneMode(
      localSite[LOCAL_SITE_PATH]
    );
  }
};

const localSite = {
  init: async files => {
    const tempDir = await localSiteDir.initLocalSite(files);
    return {
      [LOCAL_SITE_PATH]: tempDir,
      getFiles: () => localSiteDir.readLocalSite(tempDir),
      readFile: filePath => localSiteDir.readFile(tempDir, filePath),
      writeFile: (filePath, content) =>
        localSiteDir.writeFile(tempDir, filePath, content),
      deleteFile: filePath => localSiteDir.deleteFile(tempDir, filePath),
      clean: () => localSiteDir.cleanLocalSite(tempDir)
    };
  }
};

module.exports = {
  localSite,
  server
};
