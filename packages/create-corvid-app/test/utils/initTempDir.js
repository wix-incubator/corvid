const util = require("util");
const fs = require("fs-extra");
const temp = require("temp").track();
const makeTempDir = util.promisify(temp.mkdir);

module.exports = () =>
  makeTempDir("test").then(tempPath => fs.realpath(tempPath));
