const EOL = require("os").EOL;
const packageJson = require("../../package.json");
const execScript = require("../utils/execInitScript");

const EXPECTED_USAGE_INSTRUCTIONS = /^Usage: init-corvid <directory>/;

describe("CLI output", () => {
  describe("module version", () => {
    it("should be shown when running using the -v option", async () => {
      const stdout = await execScript("-v");
      expect(stdout).toEqual(packageJson.version + EOL);
    });

    it("should be shown when running using the --version option", async () => {
      const stdout = await execScript("--version");
      expect(stdout).toEqual(packageJson.version + EOL);
    });
  });

  describe("usage instructions", () => {
    it("should be shown when running with no arguments", async () => {
      const stdout = await execScript("");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });

    it("should be shown when running with the -h option", async () => {
      const stdout = await execScript("-h");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });

    it("should be shown when running with the --help option", async () => {
      const stdout = await execScript("--help");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });
  });
});
