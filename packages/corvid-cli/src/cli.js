const chalk = require("chalk");
const updateNotifier = require("update-notifier");
const getMessage = require("./messages");
const packageJson = require("../package.json");
const sessionData = require("./utils/sessionData");
const logger = require("corvid-local-logger");

updateNotifier({ pkg: packageJson }).notify();

// eslint-disable-next-line no-console
console.log(chalk.yellow(getMessage("Cli_Description_Yellow")));
// eslint-disable-next-line no-console
console.log(getMessage("Cli_Description"));

logger.info(`running [${process.argv.slice(2).join(" ")}]`);
logger.addSessionData({ command: process.argv[2] });
sessionData.on(["msid", "uuid"], (metasiteId, userId) =>
  logger.addSessionData({ metasiteId, userId })
);

require("yargs")
  .usage("Usage: $0 <command> [options]")
  .commandDir("commands")
  .help("help")
  .strict()
  .demandCommand().argv;
