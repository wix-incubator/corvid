const path = require('path');
const execa = require('execa');
const { registry } = require('./registry');

function publish() {
  process.chdir(path.join(__dirname, '../..'));

  const verdaccio = execa.shell('npx verdaccio --config e2e/verdaccio.yaml');

  execa.shellSync('npx wait-port 4873 -o silent');

  execa.shellSync(
    `npx lerna publish --yes --force-publish=* --no-git-tag-version --cd-version=minor --exact --dist-tag=latest --registry="${registry}" --allow-branch=*`,
    {
      stdio: 'inherit',
    },
  );

  return () => {
    execa.shellSync(`kill -9 ${verdaccio.pid}`);
  };
}

module.exports.publish = publish;