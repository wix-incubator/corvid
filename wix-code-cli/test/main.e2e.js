const childProcess = require("child_process");
const path = require("path");

function runFixture(name) {
  return new Promise(resolve => {
    const stdout = [];

    const child = childProcess.spawn("electron", [
      path.resolve(path.join(__dirname, "fixtures", name, "main.js"))
    ]);

    child.stdout.on("data", function(data) {
      stdout.push(data.toString());
    });

    child.on("exit", () => resolve(stdout));
  });
}

describe("main flow", () => {
  describe("clone", () => {
    it("should connect to local server", () => {
      expect.assertions(1);

      return expect(runFixture("base")).resolves.toContain(
        "local server connection established\n"
      );
    });

    it("should open the app with the correct editor URL", () => {
      expect.assertions(1);

      return expect(runFixture("base")).resolves.toContain(
        "page-title-updated\n"
      );
    });

    it("should open the editor with the local server", () => {
      expect.assertions(1);

      return expect(runFixture("base")).resolves.toContain(
        "page-title-updated\n"
      );
    });

    it("should connect", () => {
      // expect(true).toBe(false)
    });

    it("should download site files", () => {
      // expect(true).toBe(false)
    });

    it("should watch local site files", () => {
      // expect(true).toBe(false)
    });
  });
  describe("edit", () => {
    it("should connect", () => {
      // expect(true).toBe(false)
    });

    it("should upload site files", () => {
      // expect(true).toBe(false)
    });

    it("should watch local site files", () => {
      // expect(true).toBe(false)
    });
  });
});
