const uuid = require("uuid");
const initLogger = require("./initLogger");

process.env.CORVID_SESSION_ID = process.env.CORVID_SESSION_ID || uuid.v4();
process.env.CORVID_CWD = process.env.CORVID_CWD || process.cwd();

const logger = initLogger(
  process.env.CORVID_SESSION_ID,
  process.env.CORVID_CWD
);

module.exports = logger;
