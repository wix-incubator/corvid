const commander = require("commander");

const ourPackageJson = require("../package.json");
const create = require("./create");

commander
  .name(ourPackageJson.name)
  .version(ourPackageJson.version, "-v, --version")
  .arguments("<folder-name> [your-wix-site-url]")
  .usage("<folder-name> [your-wix-site-url]")
  .action(create)
  .parse(process.argv);

if (!commander.args.length) {
  commander.help();
}
