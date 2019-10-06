const tempy = require("tempy");
const puppeteer = require("puppeteer-core");
const eventually = require("wix-eventually");
const { findFreePort } = require("./drivers/utils");
const corvidCliDriverCreator = require("./drivers/cliDriver");
const localEditorDriverCreator = require("./drivers/localEditorDriver");

const testSites = [
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/cfbebf57-9622-4c13-9b67-2e6e55b2c265?metaSiteId=de7cb190-770a-46a5-8ef8-914bb8cf727c&editorSessionId=e38c6558-de49-548a-8860-f128da278c7c",
    description: "not permitted",
    errorMessage: "(Error 403)"
  }
  // {
  //   editorUrl:
  //     "https://editor.wix.com/html/editor/web/renderer/edit/cfbebf57-9622-4c13-9b67-2e6e55b2c265?metaSiteId=de7cb190-770a4-46a5-8ef8-914bb8cf727c&editorSessionId=e38c6558-de49-548a-8860-f128da278c7c",
  //   description: "non-existing metasite",
  //   errorMessage: "(Error 404)"
  // }
];

const connectToLocalEditor = async port => {
  const browser = await eventually(
    async () =>
      await puppeteer.connect({
        browserURL: `http://localhost:${port}`,
        defaultViewport: { width: 1280, height: 960 }
      }),
    { timeout: 20000 }
  );
  const localEditorDriver = await eventually(
    async () => {
      const [page] = await browser.pages();
      expect(page).toBeDefined();
      return localEditorDriverCreator(page);
    },
    { timeout: 30000 }
  );
  return localEditorDriver;
};

describe("clone", () => {
  describe("editor fail to load", () => {
    const initTempDirectory = () => {
      return tempy.directory();
    };

    let cliDriver;

    beforeEach(async () => {
      const cwd = initTempDirectory();
      cliDriver = corvidCliDriverCreator({ cwd });
      await cliDriver.logout();
    });

    testSites.forEach(({ editorUrl, description, errorMessage }) =>
      test(`should fail while cloning ${description} editor url, and display proper error`, async () => {
        const loginDebugPort = await findFreePort();

        const loginCommand = cliDriver.login({
          remoteDebuggingPort: loginDebugPort
        });
        const loginEditorDriver = await connectToLocalEditor(loginDebugPort);
        await loginEditorDriver.waitForLoginForm();

        await loginEditorDriver.login({
          username: "corvidtest@gmail.com",
          password: "1q2w3e4r"
        });

        await loginCommand;

        const cloneDebugPort = await findFreePort();
        const cloneCommand = cliDriver.clone({
          editorUrl,
          pullRemoteDebuggingPort: cloneDebugPort
        });

        const cloneEditorDriver = await connectToLocalEditor(cloneDebugPort);
        await cloneEditorDriver.waitForErrorPage();
        expect(await cloneEditorDriver.getErrorCode()).toBe(errorMessage);
        await cloneEditorDriver.close();
        await cloneCommand;
      })
    );
  });
});
