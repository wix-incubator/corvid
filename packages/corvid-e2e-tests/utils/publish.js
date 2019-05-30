const path = require("path");
const execa = require("execa");
const { registry } = require("./registry");

function publish({ dir }) {
  const destinationDirectory = dir || path.join(__dirname, "../..");

  process.chdir(destinationDirectory);

  const verdaccio = execa.shell(
    "npx verdaccio --config corvid-e2e-tests/verdaccio.yaml"
  );

  execa.shellSync("npx wait-port 4873 -o silent");

  execa.shellSync(
    `npx lerna publish --yes --force-publish=* --no-git-tag-version --cd-version=patch --exact --dist-tag=latest --registry="${registry}" --allow-branch=*`,
    {
      stdio: "inherit"
    }
  );

  return () => {
    execa.shellSync(`kill -9 ${verdaccio.pid}`);
  };
}

module.exports.publish = publish;
