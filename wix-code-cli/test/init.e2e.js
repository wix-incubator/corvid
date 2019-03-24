const chalk = require("chalk");
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

  test("should exit with an error if the given directory is not empty", () => {
    expect.assertions(1);

    fs.__setMockFiles({ "someFolder/aFile": "{}" });
    fetchMock.mock(
      "http://wix.com",
      '<head><meta http-equiv="X-Wix-Meta-Site-Id" content="123456789"/></head><body></body>'
    );

    return expect(
      init({
        url: "wix.com",
        dir: "someFolder"
      })
    ).rejects.toEqual(chalk.red(`Target directory someFolder is not empty`));
  });

  test("should clone the site", () => {});
});
