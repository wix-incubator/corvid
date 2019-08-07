const tempy = require("tempy");
const corvidCliDriverCreator = require("./drivers/cliDriver");

describe("login / logout", () => {
  let cliDriver;
  beforeEach(async done => {
    const cwd = tempy.directory();
    cliDriver = corvidCliDriverCreator({ cwd });
    await cliDriver.performLogout();
    done();
  });

  afterAll(async done => {
    await cliDriver.performLogout();
    done();
  });
  it("should not open login page after a successful login", async () => {
    await cliDriver.performLogin();
    expect(await cliDriver.isLoggedIn()).toEqual(true);
  });
  it("should open login page after a successful logout", async () => {
    await cliDriver.performLogin();
    await cliDriver.performLogout();

    expect(await cliDriver.isLoggedIn()).toEqual(false);
  });
});
