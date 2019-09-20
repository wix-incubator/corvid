const { EOL } = require("os");
const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const dedent = require("dedent");
const initTempDir = require("../utils/initTempDir");

const runCreateCorvidProject = require("../utils/runCreateCorvidProject");

const {
  start: startFakeNpmRegistry,
  publishPackage
} = require("../utils/fakeNpmRegistry");

const fakeCorvidCliPath = path.join(
  __dirname,
  "..",
  "utils",
  "fake-packages",
  "fake-corvid-cli"
);
const fakeCorvidTypesPath = path.join(
  __dirname,
  "..",
  "utils",
  "fake-packages",
  "fake-corvid-types"
);

describe("create", () => {
  let fakeNpmRegistry;
  let createCorvidProject = () => {};

  beforeAll(async () => {
    fakeNpmRegistry = await startFakeNpmRegistry();
    await publishPackage(fakeNpmRegistry.registryUrl, fakeCorvidCliPath);
    await publishPackage(fakeNpmRegistry.registryUrl, fakeCorvidTypesPath);
    createCorvidProject = args => runCreateCorvidProject(args, fakeNpmRegistry);
  });

  afterAll(async () => {
    await fakeNpmRegistry.close();
  });

  describe("project template", () => {
    it("should create the given directory if it doesn't exist", async () => {
      const projectDir = await initTempDir();
      await createCorvidProject(projectDir);
      expect(await fs.exists(projectDir)).toBeTruthy();
    });

    it("should fail working with a non-empty directory", async () => {
      const projectDir = await initTempDir();
      await fs.writeFile(path.join(projectDir, "file.js"), "some file content");
      const { stderr } = await createCorvidProject(projectDir).catch(
        err => err
      );
      expect(stderr).toMatch("Cannot initialize a non-empty directory.");
    });

    it("should create a .gitignore file", async () => {
      const projectDir = await initTempDir();
      await createCorvidProject(projectDir);

      const gitIgnore = await fs.readFile(
        path.join(projectDir, ".gitignore"),
        "utf8"
      );
      expect(gitIgnore.split(EOL)).toEqual(
        expect.arrayContaining(["/node_modules", "/.corvid/session.log"])
      );
    });

    it("should create a package.json with the project name and corvid-cli, corvid-types dependencies", async () => {
      const projectDir = path.join(await initTempDir(), "project-name");
      await createCorvidProject(projectDir);

      const packageJson = await fs.readFile(
        path.join(projectDir, "package.json"),
        "utf8"
      );
      expect(packageJson.trim(EOL)).toEqual(
        JSON.stringify(
          {
            name: "project-name",
            version: "0.1.0",
            private: true,
            devDependencies: {
              "corvid-cli": "^6.5.4",
              "corvid-types": "^9.8.7"
            }
          },
          null,
          2
        )
      );
    });
  });

  describe("dependencies", () => {
    it("should install corvid-cli dependency", async () => {
      const projectDir = await initTempDir();
      await createCorvidProject(projectDir);
      expect(
        fs.existsSync(
          path.join(projectDir, "node_modules", "corvid-cli", "package.json")
        )
      ).toBeTruthy();
    });

    it("should install corvid-types dependency", async () => {
      const projectDir = await initTempDir();
      await createCorvidProject(projectDir);
      expect(
        fs.existsSync(
          path.join(projectDir, "node_modules", "corvid-types", "package.json")
        )
      ).toBeTruthy();
    });
  });

  describe("site clone", () => {
    it("should clone a user site when given its url", async () => {
      const projectDir = await initTempDir();
      const { stdout } = await createCorvidProject(
        `${projectDir} http://my.wix.site`
      );

      expect(stdout).toMatch(
        `fake corvid-cli called in [${projectDir}] with [clone http://my.wix.site]`
      );
    });
  });

  describe("errors", () => {
    it("should cleanup in case of initialization error", async () => {
      // TODO: implement
    });

    it("should cleanup in case of an error while cloning a site", async () => {
      // TODO: implement
    });
  });

  describe("output", () => {
    it("should output relevant execution steps", async () => {
      const projectDir = await initTempDir();
      const { stdout } = await createCorvidProject(projectDir);

      expect(stdout).toMatch(dedent`
        Initializing a new project in ${chalk.cyan(projectDir)}
        Installing dependencies: ${chalk.cyan("corvid-cli")}, ${chalk.cyan(
        "corvid-types"
      )}... (this might take a few minutes)
      `);
    });

    it("should instruct the user to clone a site if no url was given", async () => {
      const projectDir = await initTempDir();
      const { stdout } = await createCorvidProject(projectDir);

      expect(stdout).toMatch(dedent`
        Done!

        A project was initialized in ${chalk.cyan(projectDir)}
        To clone a site, run:

          ${chalk.cyan(`cd ${projectDir}`)}
          ${chalk.cyan("npx corvid clone <site-url>")}
      `);
    });

    it("should instruct a user to start the local editor after a site was cloned", async () => {
      const projectDir = await initTempDir();
      const { stdout } = await createCorvidProject(
        `${projectDir} http://my.wix.site`
      );

      expect(stdout).toMatch(dedent`
        Done!

        Your site was cloned into ${chalk.cyan(projectDir)}
        You can now start working on your site by running:

          ${chalk.cyan(`cd ${projectDir}`)}
          ${chalk.cyan("npx corvid open-editor")}
      `);
    });
  });
});
