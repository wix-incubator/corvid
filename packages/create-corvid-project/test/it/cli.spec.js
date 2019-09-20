const ourPackageJson = require("../../package.json");
const createCorvidProject = require("../utils/runCreateCorvidProject");

describe("cli", () => {
  describe("module version", () => {
    it("should be shown when running using the -v option", async () => {
      const { stdout } = await createCorvidProject("-v");
      expect(stdout).toEqual(ourPackageJson.version);
    });

    it("should be shown when running using the --version option", async () => {
      const { stdout } = await createCorvidProject("--version");
      expect(stdout).toEqual(ourPackageJson.version);
    });
  });

  describe("usage instructions", () => {
    const EXPECTED_USAGE_INSTRUCTIONS = /^Usage: create-corvid-project <directory> \[site-or-editor-url\]/;

    it("should be shown when running with no arguments", async () => {
      const { stdout } = await createCorvidProject();
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });

    it("should be shown when running with the -h option", async () => {
      const { stdout } = await createCorvidProject("-h");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });

    it("should be shown when running with the --help option", async () => {
      const { stdout } = await createCorvidProject("--help");
      expect(stdout).toEqual(
        expect.stringMatching(EXPECTED_USAGE_INSTRUCTIONS)
      );
    });
  });
});
