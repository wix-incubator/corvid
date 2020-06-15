const nock = require("nock");
const testUtils = require("corvid-local-test-utils");
const eventually = require("wix-eventually").with({ timeout: 2000 });
const packageJson = require("../../package.json");

const sentryTestkit = testUtils.sentryTestkit.create(nock);

jest.mock("uuid");
const uuid = require("uuid");
uuid.v4.mockReturnValue("test-session-id");

let originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "monitoring-test";
afterAll(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

const { logger, UserError } = require("../../src/index");

describe("sentry reporting", () => {
  beforeEach(() => {
    sentryTestkit.reset();
  });

  afterAll(() => {
    sentryTestkit.stop();
  });

  it("should report an error to sentry", async () => {
    logger.error(new Error("test error"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports).toHaveLength(1);
      expect(reports[0]).toMatchObject({
        level: "error",
        message: "test error",
        error: {
          type: "Error",
          message: "test error",
          stacktrace: expect.any(Array)
        }
      });
    });
  });

  it("should report a warning to sentry", async () => {
    logger.warn(new Error("Test warning"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports).toHaveLength(1);
      expect(reports[0]).toMatchObject({
        level: "warning",
        message: "Test warning",
        error: {
          type: "Error",
          message: "Test warning",
          stacktrace: expect.any(Array)
        }
      });
    });
  });

  it("should report extra error data", async () => {
    logger.error(new Error("test error"), {
      somethingExtra: "something",
      anotherThing: "something else"
    });

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports).toHaveLength(1);
      expect(reports[0]).toMatchObject({
        level: "error",
        message: "test error",
        error: {
          type: "Error",
          message: "test error",
          stacktrace: expect.any(Array)
        },
        extra: {
          somethingExtra: "something",
          anotherThing: "something else"
        }
      });
    });
  });

  it("should report a generated session id as tag session-id", async () => {
    logger.error(new Error("test error"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports[0].tags["session-id"]).toEqual("test-session-id");
    });
  });

  it("should report the name and version of the calling module as the release", async () => {
    logger.error(new Error("test error"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports[0].release).toEqual(
        `${packageJson.name}@${packageJson.version}`
      );
    });
  });

  it("should report info, verbose, debug level logs as breadcrumbs", async () => {
    logger.info({ message: "info level log", test: "info data" });
    logger.verbose({ message: "verbose level log", test: "verbose data" });
    logger.debug("debug level log");
    logger.error(new Error("test error"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports).toHaveLength(1);
      expect(reports[0]).toMatchObject({
        level: "error",
        message: "test error",
        error: {
          type: "Error",
          message: "test error",
          stacktrace: expect.any(Array)
        },
        breadcrumbs: expect.arrayContaining([
          expect.objectContaining({
            level: "info",
            message: "info level log",
            data: { test: "info data" }
          }),
          expect.objectContaining({
            level: "info",
            message: "verbose level log",
            data: { test: "verbose data" }
          }),
          expect.objectContaining({
            level: "debug",
            message: "debug level log"
          })
        ])
      });
    });
  });

  it("should report silly level logs as extra data", async () => {
    logger.silly("silly1");
    logger.silly({ message: "silly2", reason: "verify metadata" });
    logger.error(new Error("test error"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports).toHaveLength(1);
      expect(reports[0]).toMatchObject({
        extra: {
          sillyLogs: [
            {
              level: "silly",
              message: "silly1"
            },
            {
              level: "silly",
              message: "silly2",
              extra: {
                reason: "verify metadata"
              }
            }
          ]
        }
      });
    });
  });

  it("should report UserErrors as breadcrumbs", async () => {
    const userError = new UserError("test user error");
    logger.error(userError);
    logger.error(new Error("real error"));

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(reports).toHaveLength(1);
      expect(reports[0]).toMatchObject({
        level: "error",
        message: "real error",
        error: {
          type: "Error",
          message: "real error",
          stacktrace: expect.any(Array)
        },
        breadcrumbs: expect.arrayContaining([
          expect.objectContaining({
            level: "error",
            message: "test user error",
            category: "UserError",
            data: {
              stack: userError.stack
            }
          })
        ])
      });
    });
  });
});
