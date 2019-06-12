const tempy = require("tempy");
const puppeteer = require("puppeteer-core");
const eventually = require("wix-eventually");
const { findAvailablePort } = require("./drivers/utils");
const localEditorDriverCreator = require("./drivers/localEditorDriver");
const corvidCliDriverCreator = require("./drivers/cliDriver");

const EXIT_CODE_SUCCESS = 0;
const testSites = [
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/1b5fdec1-6178-469f-84a6-e8c4968175a4?metaSiteId=47450a3c-636f-43a3-b048-86b10f330316&editorSessionId=e16e8384-5e0f-5af0-a479-d113307f0db3",
    description: "blank"
  }
  /*
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/11b54ff1-037b-44b0-b2c2-e7e7b6b91256?metaSiteId=7392948d-960b-4b0d-b0ec-ba680a2cfc4d&editorSessionId=de12a468-3001-5a6b-acf0-80e8485de35a",
    description: "wix-code"
  },
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/4833b200-ce51-4595-b2ac-c7aa33aba5b8?metaSiteId=c29bbfdb-188a-4a08-a96d-4b5bb0e0627f&editorSessionId=c98ba04e-9f37-5b14-9a76-4a47cb07ad51",
    description: "repeaters"
  },
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/ddd6b869-cd21-4f5c-9a28-c1411419a991?metaSiteId=c0af76b7-6c79-47c2-9ca2-d7ba319ec0ed&editorSessionId=67ceda2a-c916-5dc7-a6b7-8a8e53c4d606",
    description: "inputs"
  }
  */
];

const initTempDirectory = () => {
  const cwd = process.cwd();
  process.chdir(tempy.directory());
  return () => process.chdir(cwd);
};

describe("browser sanity", () => {
  let cleanup;

  beforeEach(() => cleanup = initTempDirectory())
  afterEach(() => cleanup());

  testSites.forEach(({ editorUrl, description }) =>
    test(`should clone ${description} site, open it and push without making actual changes`, async () => {
      console.log('test started') //eslint-disable-line
      expect(true).toBe(true);
      const cliDriver = corvidCliDriverCreator();
      console.log('before clone') //eslint-disable-line      
      const corvidCloneCmd = await cliDriver.clone({ editorUrl });
      expect(corvidCloneCmd.code).toEqual(EXIT_CODE_SUCCESS);
      console.log('after clone') //eslint-disable-line      
      const remoteDebuggingPort = await findAvailablePort();
      const pid = cliDriver.openEditor({ remoteDebuggingPort });
      console.log('opening editor') //eslint-disable-line      
      // await eventually(async () => {
      //   const browser = await puppeteer.connect({
      //     browserURL: `http://localhost:${remoteDebuggingPort}`,
      //     defaultViewport: { width: 1280, height: 960 }
      //   });
      //   const [page] = await browser.pages();
      //   console.log('opened editor') //eslint-disable-line      
      //   const localEditorDriver = localEditorDriverCreator(page);
      //   await localEditorDriver.waitForEditor();
      //   console.log('done waiting') //eslint-disable-line      
      //   await localEditorDriver.push();
      //   await page.close();
      //   process.kill(pid);
      //   cleanup();
      //   console.log('bye') //eslint-disable-line  
      // }, { timeout: 30000 });
    })
  );
});
