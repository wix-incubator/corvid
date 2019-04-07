const path = require("path");
const fs = require("fs");
const process = require("process");
const fetchMock = require("fetch-mock");
const jwt = require("jsonwebtoken");
const init = require("../src/apps/init");
const { version: cliModuleVersion } = require("../package.json");
const { initTempDir } = require("corvid-local-test-utils");

const mockSpinner = {
  start: () => {},
  succeed: () => {},
  fail: () => {}
};

describe("init", () => {
  process.env.CORVID_SESSION_ID = "testCorvidId";
  beforeEach(() => {});

  afterEach(() => {
    fetchMock.restore();
  });

  describe("should create a .corvidrc.json", () => {
    test("at the supplied directory", () => {});
    test("with the metasiteId of the site specified by the url", () => {});

    test("with the current cli module version", async () => {
      const tempDir = await initTempDir();

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
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
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }`,
          JSON.stringify({})
        );

      await init(
        mockSpinner,
        {
          url: "a-site.com",
          dir: tempDir
        },
        {
          name: "name",
          value:
            "JWT." +
            jwt.sign(
              { data: JSON.stringify({ userGuid: "testGuid" }) },
              "secret"
            )
        }
      );

      const corvidrc = JSON.parse(
        fs.readFileSync(path.join(tempDir, "aSite", ".corvidrc.json"), "utf8")
      );

      expect(corvidrc).toMatchObject({ cliVersion: cliModuleVersion });
    });
  });

  test("should send a BI event with the userGuid and metasiteId", async () => {
    expect.assertions(1);

    const tempDir = await initTempDir({ aSite: {} });

    fetchMock
      .mock(
        "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
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
      )
      .mock(
        `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
          process.env.CORVID_SESSION_ID
        }`,
        JSON.stringify({})
      );

    return expect(
      init(
        mockSpinner,
        {
          url: "a-site.com",
          dir: tempDir
        },
        {
          name: "name",
          value:
            "JWT." +
            jwt.sign(
              { data: JSON.stringify({ userGuid: "testGuid" }) },
              "secret"
            )
        }
      ).then(() =>
        fetchMock.called(
          `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }`
        )
      )
    ).resolves.toBe(true);
  });

  test("should exit with an error if the given directory is not empty", async () => {
    expect.assertions(1);

    const tempDir = await initTempDir({ aSite: { aFile: "file contents" } });
    fetchMock
      .mock(
        "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
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
      )
      .mock(
        `http://frog.wix.com/code?src=39&evid=200&msid=12345678&uuid=testGuid&csi=${
          process.env.CORVID_SESSION_ID
        }`,
        JSON.stringify({})
      );

    return expect(
      init(
        mockSpinner,
        {
          url: "a-site.com",
          dir: tempDir
        },
        {
          name: "name",
          value:
            "JWT." +
            jwt.sign(
              { data: JSON.stringify({ userGuid: "testGuid" }) },
              "secret"
            )
        }
      )
    ).rejects.toThrow(`Target directory ${tempDir}/aSite is not empty`);
  });

  describe("given an editor URL", () => {
    test("should exit with an error if the site is not returned by listUserSites", () => {
      expect.assertions(1);

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify([], null, 2)
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }`,
          JSON.stringify({})
        );

      return expect(
        init(
          mockSpinner,
          {
            url:
              "https://editor.wix.com/html/editor/web/renderer/edit/1633ae83-c9ff-41e2-bd1b-d5eb5a93790c?metaSiteId=96d0802a-b76d-411c-aaf4-6b8c2f474acb&editorSessionId=d3a513bd-32a0-5e3b-964e-3b69f916f17e",
            dir: "someFolder"
          },
          {
            name: "name",
            value:
              "JWT." +
              jwt.sign(
                { data: JSON.stringify({ userGuid: "testGuid" }) },
                "secret"
              )
          }
        )
      ).rejects.toThrow(/Could not extract the site name of .*/);
    });
  });

  describe("given an pre-redirect editor URL", () => {
    test("should exit with an error if the site is not returned by listUserSites", () => {
      expect.assertions(1);

      fetchMock
        .mock(
          "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
          JSON.stringify([], null, 2)
        )
        .mock(
          `http://frog.wix.com/code?src=39&evid=200&msid=96d0802a-b76d-411c-aaf4-6b8c2f474acb&uuid=testGuid&csi=${
            process.env.CORVID_SESSION_ID
          }`,
          JSON.stringify({})
        );

      return expect(
        init(
          mockSpinner,
          {
            url:
              "https://www.wix.com/editor/96d0802a-b76d-411c-aaf4-6b8c2f474acb",
            dir: "someFolder"
          },
          {
            name: "name",
            value:
              "JWT." +
              jwt.sign(
                { data: JSON.stringify({ userGuid: "testGuid" }) },
                "secret"
              )
          }
        )
      ).rejects.toThrow(/Could not extract the site name of .*/);
    });
  });

  test("should clone the site", () => {});
});
