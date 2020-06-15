const { EOL } = require("os");
const path = require("path");

const fs = require("fs-extra");
const dedent = require("dedent");

const execSync = require("./utils/execSync");
const colors = require("./utils/textColors");

const logMessage = message => {
  // eslint-disable-next-line no-console
  console.log(message);
};

const logError = errorMessage => {
  // eslint-disable-next-line no-console
  console.error(colors.error(errorMessage));
};

const copyTemplate = projectDir => {
  fs.copySync(path.join(__dirname, "template"), projectDir);
  fs.moveSync(
    path.join(projectDir, "gitignore"),
    path.join(projectDir, ".gitignore")
  );
};

const initPackage = projectDir => {
  const appName = path.basename(projectDir);
  const appPackageJsonPath = path.join(projectDir, "package.json");
  const projectPackageJson = fs.readJSONSync(appPackageJsonPath);
  projectPackageJson.name = appName;
  fs.writeFileSync(
    appPackageJsonPath,
    JSON.stringify(projectPackageJson, null, 2)
  );
};

const installDependencies = projectDir => {
  const packagesToInstall = ["corvid-cli", "corvid-types"];

  logMessage(
    `Installing dependencies: ${packagesToInstall
      .map(pkg => colors.important(pkg))
      .join(", ")}... (this might take a few minutes)`
  );

  execSync(projectDir, `npm install --save-dev ${packagesToInstall.join(" ")}`);
};

const cloneSite = (projectDir, siteUrl) => {
  logMessage("Cloning your site..." + EOL);
  execSync(projectDir, `npx corvid clone ${siteUrl}`);
};

const cleanUp = projectDir => {
  if (projectDir !== process.cwd()) {
    fs.removeSync(projectDir);
  } else {
    fs.emptyDirSync(projectDir);
  }
};

const doneNextSteps = (projectDir, wasSiteCloned) => {
  // eslint-disable-next-line no-console
  console.log(EOL);

  if (wasSiteCloned) {
    logMessage(dedent`
      Done!

      Your site was cloned into ${colors.important(projectDir)}
      You can now start working on your site by running:

        ${colors.important(`cd ${projectDir}`)}
        ${colors.important("npx corvid open-editor")}
    `);
  } else {
    logMessage(dedent`
      Done!

      A project was initialized in ${colors.important(projectDir)}
      To clone a site, run:

        ${colors.important(`cd ${projectDir}`)}
        ${colors.important("npx corvid clone <site-url>")}
    `);
  }
  // eslint-disable-next-line no-console
  console.log(EOL);
};

const create = (givenDirectory, siteUrl) => {
  if (!givenDirectory) {
    logError("Missing project directory.");
    process.exit(1);
  }
  const projectDir = path.resolve(givenDirectory);

  const dirExists = fs.existsSync(projectDir);
  const dirContents = dirExists ? fs.readdirSync(projectDir) : [];
  if (dirContents.length > 0) {
    // eslint-disable-next-line no-console
    logError("Cannot initialize a non-empty directory.");
    process.exit(1);
  }

  try {
    logMessage(`Initializing a new project in ${colors.important(projectDir)}`);
    fs.ensureDirSync(projectDir);
    copyTemplate(projectDir);
    initPackage(projectDir);
    installDependencies(projectDir);

    const shouldCloneSite = !!siteUrl;
    if (shouldCloneSite) {
      cloneSite(projectDir, siteUrl);
    }

    doneNextSteps(projectDir, shouldCloneSite);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-console
    logError("Aborting because an error occured (see above)");
    cleanUp(projectDir);
    process.exit(1);
  }
};

module.exports = create;
