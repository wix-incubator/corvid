const { runFixture } = require("./utils");

describe("main flow", () => {
  describe("clone", () => {
    it("should connect to local server", () => {
      expect.assertions(1);

      return expect(runFixture("base")).resolves.toMatchObject([
        0,
        expect.arrayContaining(["local server connection established\n"]),
        expect.anything()
      ]);
    });

    it("should open the app with the correct editor URL", () => {
      expect.assertions(1);

      return expect(runFixture("base")).resolves.toMatchObject([
        0,
        expect.arrayContaining(["fake editor loaded\n"]),
        expect.anything()
      ]);
    });

    it("should open the editor with the local server port", () => {
      expect.assertions(1);

      return expect(runFixture("base")).resolves.toMatchObject([
        0,
        expect.arrayContaining(["fake editor loaded\n"]),
        expect.anything()
      ]);
    });

    it("should exit with status code 255 when the local server is not in clone mode", () => {
      expect.assertions(1);

      return expect(runFixture("edit")).resolves.toMatchObject([
        255,
        expect.anything(),
        expect.arrayContaining(["local server is not in clone mode\n"])
      ]);
    });

    it("should download site files", () => {
      // expect(true).toBe(false)
    });

    it("should disconnect from the local server after download is complete", () => {});
  });
});
