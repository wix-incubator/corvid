const jwt = require("jsonwebtoken");
const sessionData = require("../../utils/sessionData");
const actualLogin = jest.requireActual("../login");

module.exports = Object.assign({}, actualLogin, {
  login: async () => {
    const authCookie = {
      name: "name",
      value:
        "JWT." +
        jwt.sign({ data: JSON.stringify({ userGuid: "testGuid" }) }, "secret")
    };
    await sessionData.set({
      uuid: actualLogin.parseSessionCookie(authCookie).userGuid
    });
    return authCookie;
  }
});
