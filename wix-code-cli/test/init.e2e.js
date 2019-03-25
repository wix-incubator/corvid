const path = require("path");
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

    fs.__setMockFiles({
      [path.resolve(path.join(".", "someFolder/aSite/aFile"))]: "{}"
    });
    fetchMock.mock(
      "http://wix.com",
      '<head><meta http-equiv="X-Wix-Meta-Site-Id" content="123456789"/><meta property="og:site_name" content="aSite"/></head><body></body>'
    );

    return expect(
      init({
        url: "wix.com",
        dir: "someFolder"
      })
    ).rejects.toEqual(
      expect.stringMatching(
        /Target directory .*\/someFolder\/aSite is not empty/
      )
    );
  });

  test("should exit with an error if extracting the metasite ID from the HTML fails", () => {
    expect.assertions(1);

    fs.__setMockFiles({
      [path.resolve(path.join(".", "someFolder/aSite/aFile"))]: "{}"
    });
    fetchMock.mock(
      "http://wix.com",
      '<head><meta property="og:site_name" content="aSite"/></head><body></body>'
    );

    return expect(
      init({
        url: "wix.com",
        dir: "someFolder"
      })
    ).rejects.toEqual(
      expect.stringMatching(/Could not extract the metasite ID of .*/)
    );
  });

  test("should exit with an error if extracting the site name from the HTML fails", () => {
    expect.assertions(1);

    fs.__setMockFiles({
      [path.resolve(path.join(".", "someFolder/aSite/aFile"))]: "{}"
    });
    fetchMock.mock(
      "http://wix.com",
      '<head><meta http-equiv="X-Wix-Meta-Site-Id" content="123456789"/></head><body></body>'
    );

    return expect(
      init({
        url: "wix.com",
        dir: "someFolder"
      })
    ).rejects.toEqual(
      expect.stringMatching(/Could not extract the site name of .*/)
    );
  });

  test("should clone the site", () => {});
});
