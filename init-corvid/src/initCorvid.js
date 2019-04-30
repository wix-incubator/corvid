const path = require("path");
const os = require("os");
const fs = require("fs-extra");
const commander = require("commander");
const chalk = require("chalk");

const packageJson = require("../package.json");
const initCleanableDir = require("./utils/cleanableDir");
const executeCommand = require("./utils/executeCommand");

const init = async givenDirectory => {
  if (!givenDirectory) {
    process.exit(1);
  }

  const rootDir = path.resolve(givenDirectory);
  const siteName = path.basename(rootDir);

  const cleanableDir = await initCleanableDir(rootDir);

  const sitePackageJson = {
    name: siteName,
    version: "0.1.0",
    private: true
  };

  fs.writeFileSync(
    path.join(rootDir, "package.json"),
    JSON.stringify(sitePackageJson, null, 2) + os.EOL
  );

  try {
    await executeCommand(rootDir, "npm", [
      "install",
      "--save-dev",
      "--save-exact",
      "--loglevel",
      "error",
      "corvid-cli"
    ]);

    // eslint-disable-next-line no-console
    console.log(chalk.green("Done!"));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(chalk.red("Aborting installation because an error occured:"));
    // eslint-disable-next-line no-console
    console.log(error);
    await cleanableDir.clean();
    process.exit(1);
  }
};

commander
  .name(packageJson.name)
  .version(packageJson.version, "-v, --version")
  .arguments("<directory>")
  .usage("<directory>")
  .action(init)
  .parse(process.argv);

if (!commander.args.length) {
  commander.help();
}
