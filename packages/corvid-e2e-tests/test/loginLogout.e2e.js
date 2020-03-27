/* eslint-disable no-console */
const tempy = require("tempy");
const corvidCliDriverCreator = require("./drivers/cliDriver");
const { getCorvidTestUser } = require("./drivers/utils");
const connectToLocalEditor = require("./drivers/connectToLocalEditor");

const BLANK_EDITOR_URL =
  "https://editor.wix.com/html/editor/web/renderer/edit/bdce5f39-c471-4198-9778-c6c8118dbaa8?metaSiteId=d387aea5-55d2-47cf-a348-3d1fbe316245&editorSessionId=bf5f376b-7485-4995-a6c6-d7535d9c7853";

describe("login / logout", () => {
  let cliDriver;

  beforeEach(async done => {
    const cwd = tempy.directory();
    cliDriver = corvidCliDriverCreator({ cwd });
    await (await cliDriver.logout()).waitForCommandToEnd();
    done();
  });

  afterEach(async done => {
    console.log("inside after each- killing all");
    await cliDriver.killAll();
    done();
  });

  afterAll(async done => {
    console.log("inside after all - logging out");
    await (await cliDriver.logout()).waitForCommandToEnd();
    done();
  });

  describe("after login", () => {
    it("should clone without need to login again", async () => {
      console.log("starting 1st test");
      //login
      const cliLoginCommandResult = await cliDriver.login();
      const editorDriver = await connectToLocalEditor(
        cliLoginCommandResult.editorDebugPort
      );
      const loginDriver = await editorDriver.waitForLogin();
      console.log("-- logging in...");
      await loginDriver.login(getCorvidTestUser());
      await cliLoginCommandResult.waitForCommandToEnd();
      console.log("-- logged in");

      // clone
      console.log("-- cloning");
      const cliCloneCommandResult = await cliDriver.clone({
        editorUrl: BLANK_EDITOR_URL
      });
      console.log("-- cloned");
      const editorCloneDriver = await connectToLocalEditor(
        cliCloneCommandResult.editorDebugPort
      );
      await expect(editorCloneDriver.waitForLogin()).rejects.toBeDefined();
      await cliCloneCommandResult.waitForCommandToEnd();
      console.log("1st test ended");
    });
  });

  describe("after logout", () => {
    it("should ask to login when trying to clone", async () => {
      console.log("starting 2nd test");
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
      console.log("-- logged OUT");

      // clone
      const cliCloneCommandResult = await cliDriver.clone({
        editorUrl: BLANK_EDITOR_URL
      });
      const editorCloneDriver = await connectToLocalEditor(
        cliCloneCommandResult.editorDebugPort
      );
      console.log("-- awaiting log ing");
      await expect(editorCloneDriver.waitForLogin()).resolves.toBeDefined();

      console.log("-- closing");
      await editorCloneDriver.close();
      await cliCloneCommandResult.kill();
      console.log("2nd test ended");
    });
  });
});
