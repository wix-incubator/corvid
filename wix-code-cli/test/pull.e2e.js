const { runFixture } = require("./utils");

describe("pull", () => {
  const promise = runFixture("pull", "empty-site");

  test("should connect to local server", () => {
    expect.assertions(1);

    return expect(promise).resolves.toMatchObject([
      0,
      expect.arrayContaining([
        expect.stringMatching(/Local server connection established/)
      ]),
      expect.anything()
    ]);
  });

  test("should open the app with the correct editor URL", () => {
    expect.assertions(1);

    return expect(promise).resolves.toMatchObject([
      0,
      expect.arrayContaining([expect.stringMatching(/fake editor loaded/)]),
      expect.anything()
    ]);
  });

  test("should open the editor with the local server port", () => {
    expect.assertions(1);

    return expect(promise).resolves.toMatchObject([
      0,
      expect.arrayContaining([expect.stringMatching(/Editor connected/)]),
      expect.anything()
    ]);
  });

  test("should download site files", () => {});

  test("should disconnect from the local server after download is complete", () => {});

  describe.skip("when the local server is already running in edit more", () => {
    const promise = runFixture("pull", "non-empty-site", "edit");

    test("should exit with error code 255", () => {
      expect.assertions(1);

      return expect(promise).resolves.toMatchObject([
        255,
        expect.anything(),
        expect.arrayContaining(["Local server is not in clone mode\n"])
      ]);
    });

    test("should print to stderr a message explaining the error", () => {
      expect.assertions(1);

      return expect(promise).resolves.toMatchObject([
        255,
        expect.anything(),
        expect.arrayContaining(["Local server is not in clone mode\n"])
      ]);
    });
  });

  describe("when run in a directory without a config file", () => {
    const promise = runFixture("pull", ".");

    test("should exit with error code 255", () => {
      expect.assertions(1);

      return expect(promise).resolves.toMatchObject([
        255,
        expect.anything(),
        expect.anything()
      ]);
    });

    test("should print to stderr a message explaining the error", () => {
      expect.assertions(1);

      return expect(promise).resolves.toMatchObject([
        expect.anything(),
        expect.anything(),
        expect.arrayContaining([
          expect.stringMatching(/Could not find \.wixcoderc\.json in /)
        ])
      ]);
    });
  });
});
