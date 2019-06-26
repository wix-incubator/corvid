const tempy = require("tempy");
const puppeteer = require("puppeteer-core");
const eventually = require("wix-eventually");
const { findFreePort } = require("./drivers/utils");
const corvidCliDriverCreator = require("./drivers/cliDriver");
const localEditorDriverCreator = require("./drivers/localEditorDriver");

const testSite = {
  editorUrl:
    "https://editor.wix.com/html/editor/web/renderer/edit/bdce5f39-c471-4198-9778-c6c8118dbaa8?metaSiteId=d387aea5-55d2-47cf-a348-3d1fbe316245&editorSessionId=bf5f376b-7485-4995-a6c6-d7535d9c7853",
  description: "blank"
};
let browser = null;
const connectToLocalEditor = async port => {
  browser = await eventually(
    async () =>
      await puppeteer.connect({
        browserURL: `http://localhost:${port}`,
        defaultViewport: { width: 1280, height: 960 }
      }),
    { timeout: 20000 }
  );
  const localEditorDriver = eventually(
    async () => {
      const [page] = await browser.pages();
      expect(page).toBeDefined();
      return localEditorDriverCreator(page);
    },
    { timeout: 20000 }
  );
  return localEditorDriver;
};

const initTempDirectory = () => {
  return tempy.directory();
};

let cliDriver;

beforeEach(async () => {
  const cwd = initTempDirectory();
  cliDriver = corvidCliDriverCreator({ cwd });
  await cliDriver.logout();
});

// describe("user changed the site without saving and clicked the electron close button", () => {
//   describe("dialog appears", () => {
//     describe("Cancel button has clicked", () => {
//       it("should close the dialog and keep the electron", async () => {
//         const cloneDebugPort = await findFreePort();
//         const cloneCommand = cliDriver.clone({
//           editorUrl: testSite.editorUrl,
//           remoteDebuggingPort: cloneDebugPort
//         });

//         const cloneEditorDriver = await connectToLocalEditor(cloneDebugPort);
//         console.log("clone connected"); //eslint-disable-line

//         await cloneEditorDriver.waitForLoginForm();

//         await cloneEditorDriver.login({
//           username: "corvidtest@gmail.com",
//           password: "1q2w3e4r"
//         });

//         await cloneCommand;
//         console.log("after clone command"); //eslint-disable-line
//         const openEditorDebugPort = await findFreePort();
//         const openEditorCommand = cliDriver.openEditor({
//           remoteDebuggingPort: openEditorDebugPort
//         });

//         const openEditorDriver = await connectToLocalEditor(
//           openEditorDebugPort
//         );

//         await openEditorDriver.waitForEditor();
//         // await openEditorDriver.addTextElement();
//         await openEditorDriver.subscribeToDialog();
//         await openEditorDriver.close();
//         await openEditorCommand;
//       });
//     });
//     describe("Leave button has clicked", () => {
//       it("should close the dialog and electron", async () => {});
//     });
//   });
// });
describe("user didn't changed the site and clicked the electron close button", function() {
  it("should close the dialog and electron", async () => {
    const cloneDebugPort = await findFreePort();
    const cloneCommand = cliDriver.clone({
      editorUrl: testSite.editorUrl,
      remoteDebuggingPort: cloneDebugPort
    });

    const cloneEditorDriver = await connectToLocalEditor(cloneDebugPort);
    console.log("clone connected"); //eslint-disable-line

    await cloneEditorDriver.waitForLoginForm();

    await cloneEditorDriver.login({
      username: "corvidtest@gmail.com",
      password: "1q2w3e4r"
    });

    await cloneCommand;
    console.log("after clone command"); //eslint-disable-line

    const openEditorDebugPort = await findFreePort();
    const openEditorCommand = cliDriver.openEditor({
      remoteDebuggingPort: openEditorDebugPort
    });
    const openEditorDriver = await connectToLocalEditor(openEditorDebugPort);

    const dialogSpy = jest.fn();
    openEditorDriver.subscribeToLeaveDialog(dialogSpy);

    await openEditorDriver.waitForEditor();
    await openEditorDriver.addTextElement();

    await openEditorDriver.close();

    // expect(dialogSpy).not.toHaveBeenCalled();
    await openEditorCommand;
  });
});
