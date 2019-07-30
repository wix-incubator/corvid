const testUtils = require("corvid-local-test-utils");

const revertSentryEnvOverride = testUtils.overrideEnv({ ENABLE_SENTRY: true });
afterAll(() => revertSentryEnvOverride());

const os = require("os");
const nock = require("nock");
const fs = require("fs-extra");
const eventually = require("wix-eventually").with({ timeout: 3000 });
const {
  editor: loadEditor,
  localServer,
  closeAll
} = require("../utils/autoClosing");
const { initLocalSite } = require("../utils/localSiteDir");
const { editorSiteBuilder } = require("corvid-fake-local-mode-editor");
const { localSiteBuilder } = require("corvid-local-site/testkit");

const isWindows = os.platform() === "win32";

const sentryTestkit = testUtils.sentryTestkit.create(nock);

afterEach(closeAll);

describe("santy tests for error reporting", () => {
  beforeEach(() => {
    sentryTestkit.reset();
  });

  afterAll(() => {
    sentryTestkit.stop();
  });

  it("should report clone errors to sentry", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull();
    const brokenEditorSite = Object.assign(editorSite, {
      siteDocument: { pages: null }
    });
    await loadEditor(server.port, brokenEditorSite).catch(() => {});

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(JSON.stringify(reports[0].error.stacktrace)).toEqual(
        expect.stringContaining("corvid-local-site")
      );
    });
  });

  it("should report save errors to sentry", async () => {
    const localSitePath = await initLocalSite();
    const server = await localServer.startInCloneMode(localSitePath);

    const editorSite = editorSiteBuilder.buildFull();
    const editor = await loadEditor(server.port, editorSite);

    const illegalDocument = Object.assign({}, editorSite.siteDocument, {
      pages: null
    });
    editor.modifyDocument(illegalDocument);
    await editor.save().catch(() => {});

    await eventually(() => {
      const reports = sentryTestkit.reports();
      expect(JSON.stringify(reports[0].error.stacktrace)).toEqual(
        expect.stringContaining("corvid-local-site")
      );
    });
  });

  if (!isWindows) {
    it("should report errors loading in edit mode", async () => {
      const localSite = localSiteBuilder.buildFull();
      const localSitePath = await initLocalSite(localSite);

      await fs.chmod(localSitePath, fs.constants.S_IWUSR); // owner can only write
      await localServer.startInEditMode(localSitePath).catch(() => {});

      await eventually(() => {
        const reports = sentryTestkit.reports();
        expect(JSON.stringify(reports[0].error.message)).toEqual(
          expect.stringContaining("EACCES: permission denied")
        );
      });
    });
  }
});
