const uuid = require("uuid");
const initLogger = require("./initLogger");

const sessionId = uuid.v4();

const logger = initLogger(sessionId);

module.exports = logger;
