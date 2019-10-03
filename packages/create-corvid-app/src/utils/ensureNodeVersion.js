const { EOL } = require("os");
var semver = require("semver");
var chalk = require("chalk");

const minNodeVersion = "10.0.0";

if (!semver.satisfies(process.version, `>=${minNodeVersion}`)) {
  // eslint-disable-next-line no-console
  console.error(
    chalk.yellow(
      `You are using an unsupported Node version ${semver.clean(
        process.version
      )}.` +
        EOL +
        `Please install version ${minNodeVersion} or higher.`
    )
  );
  process.exit(1);
}
