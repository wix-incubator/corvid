const chalk = require("chalk");
const version = require("./version");

// eslint-disable-next-line no-console
console.log(chalk.yellow("Corvid Technical Preview"));
// eslint-disable-next-line no-console
console.log(`
Find out more about Corvid at www.wix.com/corvid
The Corvid CLI is used for working with local versions of your Wix sites. Using the CLI you can create new local projects, open a local editor, and pull project updates.
`);

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
    chalk.red("Unsupported Node.js version, please use", version.required)
  );
}
