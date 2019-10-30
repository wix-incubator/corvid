const testUtils = require("corvid-local-test-utils");

const revertSentryEnvOverride = testUtils.overrideEnv({ ENABLE_SENTRY: true });
afterAll(() => revertSentryEnvOverride());

const nock = require("nock");
const fetchMock = require("fetch-mock");
const eventually = require("wix-eventually");

const { initTempDir } = require("corvid-local-test-utils");
const sessionData = require("../../src/utils/sessionData");
const { killAllChildProcesses } = require("../../src/utils/electron");

const cliDriver = require("./cliDriver");

const sentryTestkit = testUtils.sentryTestkit.create(nock);

jest.mock("../../src/commands/login");

describe("santy tests for error reporting", () => {
  afterEach(async () => {
    sessionData.reset();
    fetchMock.restore();
    await killAllChildProcesses();
  });

  beforeEach(() => {
    sentryTestkit.reset();
  });

  afterAll(() => {
    sentryTestkit.stop();
  });

  const createDirectoryWithBadCorvidRcFile = () =>
    initTempDir({
      ".corvid": { "corvidrc.json": "BAD CORVID RC" }
    });

  it("should report pull errors to sentry", async () => {
    const tempDir = await createDirectoryWithBadCorvidRcFile();

    cliDriver.pull(tempDir).catch(() => {});

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(JSON.stringify(reports[0].error.message)).toEqual(
        expect.stringContaining("Unexpected token B in JSON at position 0")
      );
    });
  });

  it("should report open-editor errors to sentry", async () => {
    const tempDir = await createDirectoryWithBadCorvidRcFile();

    cliDriver.openEditor(tempDir).catch(() => {});

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(JSON.stringify(reports[0].error.message)).toEqual(
        expect.stringContaining("Unexpected token B in JSON at position 0")
      );
    });
  });

  it("should report clone errors to sentry", async () => {
    const testSiteUrl = "http://www.mysite.com";

    const tempDir = await initTempDir();

    fetchMock.mock(
      "https://www.wix.com/_api/corvid-devex-service/v1/listUserSites",
      () => {
        throw new Error("test error");
      }
    );

    cliDriver.clone(tempDir, testSiteUrl).catch(() => {});

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports[0].error.message).toEqual("test error");
    });
  });
});
