const { URL } = require("url");
const logger = require("corvid-local-logger");
const getMessage = require("../messages");

function originsMiddleware(allowedDomains = []) {
  return (socket, next) => {
    const origin = socket.handshake.headers.origin || "";
    const hostname = origin && new URL(origin).hostname;

    if (!allowedDomains.includes(hostname)) {
      logger.warn(getMessage("AdminToken_Error_Log", { origin }));
      return next(new Error(getMessage("Origin_Error")));
    }
    logger.warn(getMessage("Origin_Accepted_Log", { origin }));
    next();
  };
}

module.exports = originsMiddleware;
