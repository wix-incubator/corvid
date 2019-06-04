const chalk = require("chalk");
const updateNotifier = require("update-notifier");
const version = require("./version");
const getMessage = require("./messages");
const packageJson = require("../package.json");

updateNotifier({ pkg: packageJson }).notify();

// eslint-disable-next-line no-console
console.log(chalk.yellow(getMessage("Cli_Description_Yellow")));
// eslint-disable-next-line no-console
console.log(getMessage("Cli_Description"));

if (version.check()) {
  require("yargs")
    .usage("Usage: $0 <command> [options]")
    .commandDir("commands")
    .help("help")
    .strict()
    .demandCommand().argv;
} else {
  // eslint-disable-next-line no-console
  console.log(
    chalk.red(getMessage("Cli_Unsupported_Node_Version"), version.required)
  );
}
