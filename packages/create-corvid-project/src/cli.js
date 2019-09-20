const commander = require("commander");

const ourPackageJson = require("../package.json");
const create = require("./create");

commander
  .name(ourPackageJson.name)
  .version(ourPackageJson.version, "-v, --version")
  .arguments("<directory> [site-or-editor-url]")
  .usage("<directory> [site-or-editor-url]")
  .action(create)
  .parse(process.argv);

if (!commander.args.length) {
  commander.help();
}
