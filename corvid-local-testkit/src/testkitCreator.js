const fs = require("fs");
const { initTempDir, siteCreators } = require("corvid-local-test-utils");
const { localSiteBuilder } = require("corvid-local-site/testkit");

const localServerTestkit = require("corvid-local-server/testkit");

const createTestKit = () => {
  return {
    initSite: async siteItems => {
      const localSitePath = await initTempDir(siteItems);
      return localSitePath;
    },
    // cleanUp: site => {
    //   console.log(site);
    // },
    server: {
      startInEditMode: async localSitePath => {
        const {
          close,
          port,
          adminPort
        } = await localServerTestkit.startInCloneMode(localSitePath);
        return {
          close,
          port,
          adminPort
        };
      },
      startInCloneMode: async localSitePath => {
        const {
          close,
          port,
          adminPort
        } = await localServerTestkit.startInCloneMode(localSitePath);
        return {
          close,
          port,
          adminPort
        };
      }
    },
    fs,
    siteCreators,
    localSiteBuilder
  };
};

module.exports = createTestKit;
