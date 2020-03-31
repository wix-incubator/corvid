const tempy = require("tempy");
const corvidCliDriverCreator = require("./drivers/cliDriver");
const { getCorvidTestUser } = require("./drivers/utils");
const connectToLocalEditor = require("./drivers/connectToLocalEditor");

const BLANK_EDITOR_URL =
  "https://editor.wix.com/html/editor/web/renderer/edit/bdce5f39-c471-4198-9778-c6c8118dbaa8?metaSiteId=d387aea5-55d2-47cf-a348-3d1fbe316245&editorSessionId=bf5f376b-7485-4995-a6c6-d7535d9c7853";

describe("login / logout", () => {
  let cliDriver;

  beforeEach(async () => {
    const cwd = tempy.directory();
    cliDriver = corvidCliDriverCreator({ cwd });
    await (await cliDriver.logout()).waitForCommandToEnd();
  });

  afterEach(async () => {
    await cliDriver.killAll();
  });

  afterAll(async () => {
    await (await cliDriver.logout()).waitForCommandToEnd();
  });

  describe("after login", () => {
    it.only("should clone without need to login again", async () => {
      // //login
      // const cliLoginCommandResult = await cliDriver.login();
      // const editorDriver = await connectToLocalEditor(
      //   cliLoginCommandResult.editorDebugPort
      // );
      // const loginDriver = await editorDriver.waitForLogin();
      // await loginDriver.login(getCorvidTestUser());
      // await cliLoginCommandResult.waitForCommandToEnd();

      // hack login
      const cliHackLoginCommand = await cliDriver.hackLogin();
      await cliHackLoginCommand.waitForCommandToEnd();

      // clone
      const cliCloneCommandResult = await cliDriver.clone({
        editorUrl: BLANK_EDITOR_URL
      });
      const editorCloneDriver = await connectToLocalEditor(
        cliCloneCommandResult.editorDebugPort
      );
      await expect(editorCloneDriver.waitForLogin()).rejects.toBeDefined();
      await cliCloneCommandResult.waitForCommandToEnd();
    });
  });

  describe("after logout", () => {
    it("should ask to login when trying to clone", async () => {
      //login
      const cliLoginCommandResult = await cliDriver.login();
      const editorDriver = await connectToLocalEditor(
        cliLoginCommandResult.editorDebugPort
      );

      const loginDriver = await editorDriver.waitForLogin();
      await loginDriver.login(getCorvidTestUser());
      await cliLoginCommandResult.waitForCommandToEnd();

      // logout
      await (await cliDriver.logout()).waitForCommandToEnd();

      // clone
      const cliCloneCommandResult = await cliDriver.clone({
        editorUrl: BLANK_EDITOR_URL
      });
      const editorCloneDriver = await connectToLocalEditor(
        cliCloneCommandResult.editorDebugPort
      );
      await expect(editorCloneDriver.waitForLogin()).resolves.toBeDefined();

      await editorCloneDriver.close();
      await cliCloneCommandResult.kill();
    });
  });
});
