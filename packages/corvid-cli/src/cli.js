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
sessionData.on(["msid"], metasiteId => logger.addSessionData({ metasiteId }));

const withRemoteDebugging = command =>
  Object.assign({}, command, {
    builder: args =>
      args.option("remote-debugging-port", {
        describe: "port for remote debugging",
        type: "number",
        hidden: true
      })
  });

require("yargs")
  .usage("Usage: $0 <command> [options]")
  .commandDir("commands", { visit: withRemoteDebugging })
  .help("help")
  .strict()
  .demandCommand().argv;
