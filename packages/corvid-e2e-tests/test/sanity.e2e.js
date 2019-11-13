const tempy = require("tempy");
const eventually = require("wix-eventually");
const { getCorvidTestUser } = require("./drivers/utils");
const corvidCliDriverCreator = require("./drivers/cliDriver");
const connectToLocalEditor = require("./drivers/connectToLocalEditor");
const utils = require("corvid-local-test-utils");
const path = require("path");

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
  let cwd;

  beforeEach(async done => {
    cwd = tempy.directory();
    cliDriver = corvidCliDriverCreator({ cwd });
    await (await cliDriver.logout()).waitForCommandToEnd();
    done();
  });

  afterAll(async done => {
    await (await cliDriver.logout()).waitForCommandToEnd();
    done();
  });

  async function cloneSite(editorUrl) {
    const cliCloneCommandResult = await cliDriver.clone({
      editorUrl
    });
    const editorCloneDriver = await connectToLocalEditor(
      cliCloneCommandResult.editorDebugPort
    );

    const loginDriver = await editorCloneDriver.waitForLogin();
    await loginDriver.login(getCorvidTestUser());

    await cliCloneCommandResult.waitForCommandToEnd();
  }

  testSites.forEach(({ editorUrl, description }) =>
    test(`should clone ${description} site, open it and push without making actual changes`, async () => {
      await cloneSite(editorUrl);

      const openEditorCliCommand = await cliDriver.openEditor();
      const editorDriver = await connectToLocalEditor(
        openEditorCliCommand.editorDebugPort
      );

      const editDriver = await editorDriver.waitForEditor();
      await editDriver.push();
      await editorDriver.close();
      await openEditorCliCommand.waitForCommandToEnd();
    })
  );

  test("should show a warning message when closing with unsaved changes and allow to continue working", async () => {
    const testEditorUrl = testSites[0].editorUrl;
    await cloneSite(testEditorUrl);

    const openEditorCliCommand = await cliDriver.openEditor({
      env: { SKIP_UNSAVED_DIALOG: true }
    });
    const editorDriver = await connectToLocalEditor(
      openEditorCliCommand.editorDebugPort
    );
    const editDriver = await editorDriver.waitForEditor();

    await editDriver.addTextElement();

    openEditorCliCommand.kill("SIGINT", {
      forceKillAfterTimeout: false
    });

    await eventually(() => {
      expect(openEditorCliCommand.getOutput()).toContain(
        "You have unsaved changes in editor"
      );
    });
    await editDriver.saveLocal();

    await editorDriver.close();
    await openEditorCliCommand.waitForCommandToEnd();
  });

  test("should exit on decode error", async () => {
    const testEditorUrl = testSites[0].editorUrl;
    await cloneSite(testEditorUrl);
    const relativeFilePart = path.join("pages", "HOME.c1dmp", "HOME.wix");
    const fileContent = await utils.localSiteDir.readFile(
      cwd,
      relativeFilePart
    );
    const file = JSON.parse(fileContent);
    file["content"]["content"] = "bad_encoded_part";
    const brokenFileContent = JSON.stringify(file, null, 2);
    await utils.localSiteDir.writeFile(
      cwd,
      relativeFilePart,
      brokenFileContent
    );
    const openEditorCliCommand = await cliDriver.openEditor();

    await connectToLocalEditor(openEditorCliCommand.editorDebugPort);

    await eventually(() => {
      expect(openEditorCliCommand.getOutput()).toContain(
        "Error decoding pages.c1dmp.content. Try reverting to an older version."
      );
    });
  });
});
