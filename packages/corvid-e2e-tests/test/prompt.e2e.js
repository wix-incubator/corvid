const tempy = require("tempy");
const puppeteer = require("puppeteer-core");
const eventually = require("wix-eventually");
const { findAvailablePort } = require("./drivers/utils");
const localEditorDriverCreator = require("./drivers/localEditorDriver");
const corvidCliDriverCreator = require("./drivers/cliDriver");

const EXIT_CODE_SUCCESS = 0;
const editorUrl =
  "https://editor.wix.com/html/editor/web/renderer/edit/1b5fdec1-6178-469f-84a6-e8c4968175a4?metaSiteId=47450a3c-636f-43a3-b048-86b10f330316&editorSessionId=e16e8384-5e0f-5af0-a479-d113307f0db3";

const initTempDirectory = () => {
  const cwd = process.cwd();
  process.chdir(tempy.directory());
  return () => process.chdir(cwd);
};

describe("browser sanity", () => {
  let cleanup;

  afterEach(() => cleanup());

  it(`should prompt`, async () => {
    cleanup = initTempDirectory();
    const cliDriver = corvidCliDriverCreator();
    const corvidCloneCmd = await cliDriver.clone({ editorUrl });
    expect(corvidCloneCmd.code).toEqual(EXIT_CODE_SUCCESS);
    const remoteDebuggingPort = await findAvailablePort();
    const pid = cliDriver.openEditor({ remoteDebuggingPort });
    await eventually(
      async () => {
        const browser = await puppeteer.connect({
          browserURL: `http://127.0.0.1:${remoteDebuggingPort}`,
          defaultViewport: { width: 1280, height: 960 }
        });
        const [page] = await browser.pages();
        const localEditorDriver = localEditorDriverCreator(page);
        await localEditorDriver.waitForEditor();
        await localEditorDriver.addTextElement();
        await page.close();
        process.kill(pid);
        cleanup();
      },
      { timeout: 20000 }
    );
  });
});
