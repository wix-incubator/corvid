const EOL = require("os").EOL;
const exec = require("./exec");

const getLatestVersion = async moduleName => {
  const output = await exec(process.cwd(), "npm", [
    "view",
    moduleName,
    "version"
  ]);
  return output.trim(EOL);
};

module.exports = getLatestVersion;
