const { runFixture } = require("./utils");

describe("pull", () => {
  const promise = runFixture("pull");

  test("should connect to local server", () => {
    expect.assertions(1);

    return expect(promise).resolves.toMatchObject([
      0,
      expect.arrayContaining(["local server connection established\n"]),
      expect.anything()
    ]);
  });

  test("should open the app with the correct editor URL", () => {
    expect.assertions(1);

    return expect(promise).resolves.toMatchObject([
      0,
      expect.arrayContaining(["fake editor loaded\n"]),
      expect.anything()
    ]);
  });

  test("should open the editor with the local server port", () => {
    expect.assertions(1);

    return expect(promise).resolves.toMatchObject([
      0,
      expect.arrayContaining(["editor connected\n"]),
      expect.anything()
    ]);
  });

  test("should exit with status code 255 when the local server is not in clone mode", () => {
    expect.assertions(1);

    return expect(runFixture("pull", ["edit"])).resolves.toMatchObject([
      255,
      expect.anything(),
      expect.arrayContaining(["local server is not in clone mode\n"])
    ]);
  });

  test("should download site files", () => {
    // expect(true).toBe(false)
  });

  test("should disconnect from the local server after download is complete", () => {});
});
