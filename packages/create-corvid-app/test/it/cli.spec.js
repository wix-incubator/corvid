const ourPackageJson = require("../../package.json");
const createCorvidApp = require("../utils/runCreateCorvidApp");

describe("cli", () => {
  describe("module version", () => {
    it("should be shown when running using the -v option", async () => {
      const { stdout } = await createCorvidApp("-v");
      expect(stdout).toEqual(ourPackageJson.version);
    });

    it("should be shown when running using the --version option", async () => {
      const { stdout } = await createCorvidApp("--version");
      expect(stdout).toEqual(ourPackageJson.version);
    });
  });

  describe("usage instructions", () => {
    const EXPECTED_USAGE_INSTRUCTIONS = /^Usage: create-corvid-app <folder-name> \[your-wix-site-url\]/;

    it("should be shown when running with no arguments", async () => {
      const { stdout } = await createCorvidApp();
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });

    it("should be shown when running with the -h option", async () => {
      const { stdout } = await createCorvidApp("-h");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });

    it("should be shown when running with the --help option", async () => {
      const { stdout } = await createCorvidApp("--help");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });
  });
});
