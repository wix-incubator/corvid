const readPkgUp = require("read-pkg-up");

const getCalledPackageId = calledNodeModule => {
  try {
    const callerModulePath = calledNodeModule.parent.filename;
    const callerPackageJson = readPkgUp.sync({ cwd: callerModulePath }).package;
    return `${callerPackageJson.name}@${callerPackageJson.version}`;
  } catch (e) {
    return null;
  }
};

module.exports = getCalledPackageId;
