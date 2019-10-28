const execa = require("execa");
const scriptPath = require.resolve("../../src/index");

const runCreateCorvidApp = (args = "", fakeNpmRegistry) =>
  execa("node", `${scriptPath} ${args}`.trim().split(" "), {
    env: {
      npm_config_registry: fakeNpmRegistry
        ? fakeNpmRegistry.registryUrl
        : "http://localhost:1234/non-existing-registry"
    }
  });

module.exports = runCreateCorvidApp;
