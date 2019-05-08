const EOL = require("os").EOL;
const path = require("path");
const fs = require("fs-extra");
const execScript = require("../utils/execInitScript");
const initTempDir = require("../utils/initTempDir");
const getLatestVersion = require("../utils/getLatestVersion");

describe("Project Init", () => {
  let workingDirectory = null;
  let targetDirectory = null;

  beforeAll(async () => {
    const givenDirectory = path.join("something", "my-site");
    workingDirectory = await initTempDir();
    await execScript(givenDirectory, workingDirectory);
    targetDirectory = path.join(workingDirectory, givenDirectory);
  }, 50000);

  it("should create the given directory", async () => {
    expect(fs.existsSync(targetDirectory)).toBeTruthy();
  });

  it("should create a pretty package.json file with the site name and corvid-cli dependency", async () => {
    const currentCorvidCliVersion = await getLatestVersion("corvid-cli");

    const packageJson = fs.readFileSync(
      path.join(targetDirectory, "package.json"),
      "utf8"
    );
    expect(packageJson).toEqual(
      JSON.stringify(
        {
          name: path.basename(targetDirectory),
          version: "0.1.0",
          private: true,
          devDependencies: {
            "corvid-cli": currentCorvidCliVersion
          }
        },
        null,
        2
      ) + EOL
    );
  });

  it("should install corvid-cli as a dependency", async () => {
    const expectedCliModulePath = path.join(
      targetDirectory,
      "node_modules",
      "corvid-cli"
    );
    expect(fs.existsSync(expectedCliModulePath)).toBeTruthy();
  });

  describe("User output", () => {
    // TODO: impelement
  });

  describe("Errors", () => {
    // TODO: impelement
  });
});
