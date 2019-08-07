const wixEventually = require("wix-eventually");
const getPort = require("get-port");

module.exports = {
  byAid: aid => `[data-aid="${aid}"]`,
  eventually: wixEventually.with({ timeout: 40000 }),
  findFreePort: getPort,
  getCorvidTestUser: () => ({
    username: "corvidtest@gmail.com",
    password: "1q2w3e4r"
  })
};
