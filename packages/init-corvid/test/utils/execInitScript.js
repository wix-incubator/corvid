const initTempDir = require("./initTempDir");
const scriptPath = require.resolve("../../src/index");
const exec = require("./exec");

const execScript = async (options = "", workingDirectory) => {
  workingDirectory = workingDirectory || (await initTempDir());
  const args = options ? options.split(" ") : [];
  return exec(workingDirectory, "node", [scriptPath, ...args]);
};

module.exports = execScript;
