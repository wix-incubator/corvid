const chalk = require("chalk");
const getMessage = require("./messages");
const sessionData = require("./utils/sessionData");
const logger = require("corvid-local-logger");
const notifyOnUpdatedPackages = require("./utils/notifyOnUpdatedPackages");

notifyOnUpdatedPackages();

// eslint-disable-next-line no-console
console.log(chalk.yellow(getMessage("Cli_Description_Yellow")));
// eslint-disable-next-line no-console
console.log(getMessage("Cli_Description"));

const fullCommand = process.argv.slice(2).join(" ");

logger.info(`running [${fullCommand}]`);
logger.addSessionData({
  command: process.argv[2],
  fullCommand
});
sessionData.on(["msid", "uuid"], (metasiteId, userId) =>
  logger.addSessionData({ metasiteId, userId })
);

require("yargs")
  .usage("Usage: $0 <command> [options]")
  .commandDir("commands")
  .help("help")
  .strict()
  .demandCommand().argv;
