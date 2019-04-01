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
      "https://www.wix.com/_api/wix-code-devex-service/v1/listUserSites",
      JSON.stringify(
        [
          {
            metasiteId: "12345678",
            publicUrl: "http://a-site.com",
            siteName: "aSite"
          }
        ],
        null,
        2
      )
    );

    return expect(
      init(
        {
          url: "a-site.com",
          dir: "someFolder"
        },
        { name: "name", value: "value" }
      )
    ).rejects.toEqual(
      expect.stringMatching(
        /Target directory .*\/someFolder\/aSite is not empty/
      )
    );
  });

  describe("given an editor URL", () => {
    test("should exit with an error if the site is not returned by listUserSites", () => {
      expect.assertions(1);

      fetchMock.mock(
        "https://www.wix.com/_api/wix-code-devex-service/v1/listUserSites",
        JSON.stringify([], null, 2)
      );

      return expect(
        init(
          {
            url:
              "https://editor.wix.com/html/editor/web/renderer/edit/1633ae83-c9ff-41e2-bd1b-d5eb5a93790c?metaSiteId=96d0802a-b76d-411c-aaf4-6b8c2f474acb&editorSessionId=d3a513bd-32a0-5e3b-964e-3b69f916f17e",
            dir: "someFolder"
          },
          { name: "name", value: "value" }
        )
      ).rejects.toEqual(
        expect.stringMatching(/Could not extract the site name of .*/)
      );
    });
  });

  describe("given an pre-redirect editor URL", () => {
    test("should exit with an error if the site is not returned by listUserSites", () => {
      expect.assertions(1);

      fetchMock.mock(
        "https://www.wix.com/_api/wix-code-devex-service/v1/listUserSites",
        JSON.stringify([], null, 2)
      );

      return expect(
        init(
          {
            url:
              "https://www.wix.com/editor/96d0802a-b76d-411c-aaf4-6b8c2f474acb",
            dir: "someFolder"
          },
          { name: "name", value: "value" }
        )
      ).rejects.toEqual(
        expect.stringMatching(/Could not extract the site name of .*/)
      );
    });
  });

  test("should clone the site", () => {});
});
