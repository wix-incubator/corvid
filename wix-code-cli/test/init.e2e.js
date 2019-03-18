const fetchMock = require("fetch-mock");
const init = require("../src/apps/init");

jest.mock("fs");
const fs = require("fs");

describe("init", () => {
  beforeEach(() => {});

  afterEach(() => {
    fetchMock.restore();
  });

  describe("should create a .wixcoderc.json", () => {
    test("at the supplied directory", () => {});
    test("with the metasiteId of the site specified by the url", () => {});
  });

  test("should exit with an error if the given directory is not empty", async () => {
    expect.assertions(1);

    fs.__setMockFiles({ "someFolder/aFile": "{}" });
    fetchMock.mock(
      "http://wix.com",
      '<head><meta http-equiv="X-Wix-Meta-Site-Id" content="123456789"/></head><body></body>'
    );

    const initResult = await init({
      url: "wix.com",
      dir: "someFolder"
    });
    initResult.matchWith({
      Error: ({ value: codeAndReason }) =>
        expect(codeAndReason).toEqual([
          -1,
          `target directory someFolder is not empty`
        ]),
      Ok: () => {
        throw new Error("unexpected result");
      }
    });
  });

  test("should clone the site", () => {});
});
