const path = require("path");
const fs = require("fs-extra");
const findFreePort = require("find-free-port");

const execa = require("execa");

const initTempDir = require("./initTempDir");

const which = require("npm-which")(__dirname);
const verdaccioBinPath = which.sync("verdaccio");

const start = async () => {
  const [freePort] = await findFreePort(4873);
  const tempDir = await initTempDir();

  const registryUrl = `http://localhost:${freePort}`;

  const verdaccioConfig = {
    storage: path.join(tempDir, "verdaccio-storage"),
    packages: {
      "**": {
        access: "$all",
        publish: "$all"
      }
    },
    listen: registryUrl,
    logs: [{ type: `stdout`, format: `pretty`, level: `debug` }]
  };

  const configPath = path.join(tempDir, "verdaccio.json");
  await fs.writeJSON(configPath, verdaccioConfig);

  const verdaccioProcess = execa(verdaccioBinPath, ["-c", configPath], {
    cwd: tempDir
  });

  await new Promise(resolve => {
    verdaccioProcess.stdout.on("data", data => {
      if (data.toString().includes(registryUrl)) {
        resolve();
      }
    });
  });

  return {
    registryUrl,
    close: () => verdaccioProcess.kill()
  };
};

const publishPackage = async (registry, packagePath) =>
  execa("npm", `publish --registry ${registry}`.split(" "), {
    cwd: packagePath
  });

module.exports = {
  start,
  publishPackage
};
