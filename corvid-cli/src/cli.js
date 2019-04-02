const chalk = require("chalk");

// eslint-disable-next-line no-console
console.log(chalk.yellow("Corvid Technical Preview"));
// eslint-disable-next-line no-console
console.log(`
Find out more about Corvid at www.wix.com/corvid
The Corvid CLI is used for working with local versions of your Wix sites. Using the CLI you can create new local projects, open a local editor, and pull project updates.
`);
require("yargs")
  .usage("Usage: $0 <command> [options]")
  .commandDir("commands")
  .help("help")
  .demandCommand().argv;
