const jwt = require("jsonwebtoken");
const sessionData = require("../../utils/sessionData");
const { parseSessionCookie } = jest.requireActual("../login");

module.exports = {
  login: async () => {
    const authCookie = {
      name: "name",
      value:
        "JWT." +
        jwt.sign({ data: JSON.stringify({ userGuid: "testGuid" }) }, "secret")
    };
    await sessionData.set({ uuid: parseSessionCookie(authCookie).userGuid });
    return authCookie;
  }
};
