const execa = require("execa");
const tempy = require("tempy");
const puppeteer = require("puppeteer-core");
const eventually = require("wix-eventually");
const localEditorDriverCreator = require("./drivers/localEditorDriver");

const EXIT_CODE_SUCCESS = 0;
const testSites = [
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/1b5fdec1-6178-469f-84a6-e8c4968175a4?metaSiteId=47450a3c-636f-43a3-b048-86b10f330316&editorSessionId=e16e8384-5e0f-5af0-a479-d113307f0db3",
    description: "blank"
  }
];

const initTempDirectory = () => {
  const cwd = process.cwd();
  process.chdir(tempy.directory());
  return () => process.chdir(cwd);
};

describe("sanity e2e", () => {
  let cleanup;
  jest.setTimeout(20000);

  afterEach(() => cleanup());

  testSites.forEach(({ editorUrl, description }) =>
    it(`should generate ${description} site and interact with it`, async () => {
      cleanup = initTempDirectory();
      const corvidCloneCmd = await execa.shellSync(
        `npx corvid clone ${editorUrl}`
      );
      expect(corvidCloneCmd.code).toEqual(EXIT_CODE_SUCCESS);

      execa.shell("npx corvid open-editor --remote-debugging-port=9595");
      await eventually(async () => {
        const browser = await puppeteer.connect({
          browserURL: "http://127.0.0.1:9595",
          defaultViewport: { width: 1280, height: 960 }
        });
        const [page] = await browser.pages();
        const localEditorDriver = localEditorDriverCreator(page);
        await localEditorDriver.waitForEditor();
        await localEditorDriver.push();
      });

      cleanup();
    })
  );
});
