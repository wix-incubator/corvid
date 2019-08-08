const tempy = require("tempy");
const { getCorvidTestUser } = require("./drivers/utils");
const corvidCliDriverCreator = require("./drivers/cliDriver");
const connectToLocalEditor = require("./drivers/connectToLocalEditor");

const testSites = [
  {
    editorUrl:
      "https://editor.wix.com/html/editor/web/renderer/edit/bdce5f39-c471-4198-9778-c6c8118dbaa8?metaSiteId=d387aea5-55d2-47cf-a348-3d1fbe316245&editorSessionId=bf5f376b-7485-4995-a6c6-d7535d9c7853",
    description: "blank"
  }
  // {
  //   editorUrl:
  //     "https://editor.wix.com/html/editor/web/renderer/edit/356795a0-49ed-4503-b662-2552189be995?metaSiteId=f248b2fc-953b-4c46-85c0-132f851ad6c2&editorSessionId=ebbc915a-dea0-4ad8-8a41-fb2b1fff65ab",
  //   description: "inputs"
  // },
  // {
  //   editorUrl:
  //     "https://editor.wix.com/html/editor/web/renderer/edit/425f3d9a-0d1b-45bd-9ce7-47cdac76d6a4?metaSiteId=ce77f15d-c430-4d6a-bb53-c56cb0f75ffb&editorSessionId=d8b144f4-71c4-42de-a0f4-5e08f4b06674",
  //   description: "wix-code"
  // }
  // {
  //   editorUrl:
  //     "https://editor.wix.com/html/editor/web/renderer/edit/4833b200-ce51-4595-b2ac-c7aa33aba5b8?metaSiteId=c29bbfdb-188a-4a08-a96d-4b5bb0e0627f&editorSessionId=c98ba04e-9f37-5b14-9a76-4a47cb07ad51",
  //   description: "repeaters"
  // }
];

describe("browser sanity", () => {
  let cliDriver;

  beforeEach(async done => {
    const cwd = tempy.directory();
    cliDriver = corvidCliDriverCreator({ cwd });
    await (await cliDriver.logout()).waitForCommandToEnd();
    done();
  });

  afterAll(async done => {
    await (await cliDriver.logout()).waitForCommandToEnd();
    done();
  });

  testSites.forEach(({ editorUrl, description }) =>
    test(`should clone ${description} site, open it and push without making actual changes`, async () => {
      // clone
      const cliCloneCommandResult = await cliDriver.clone({
        editorUrl
      });
      const editorCloneDriver = await connectToLocalEditor(
        cliCloneCommandResult.remoteDebuggingPort
      );
      console.log("clone connected"); //eslint-disable-line

      const loginDriver = await editorCloneDriver.waitForLogin();
      await loginDriver.login(getCorvidTestUser());
      console.log("after login"); //eslint-disable-line

      await cliCloneCommandResult.waitForCommandToEnd();
      console.log("after clone"); //eslint-disable-line

      const openEditorCliCommand = await cliDriver.openEditor();
      const editorEditDriver = await connectToLocalEditor(
        openEditorCliCommand.remoteDebuggingPort
      );
      console.log("edit connected"); //eslint-disable-line

      const editDriver = await editorEditDriver.waitForEditor();
      await editDriver.push();
      await editorEditDriver.close();
      await openEditorCliCommand.waitForCommandToEnd();
    })
  );
});
