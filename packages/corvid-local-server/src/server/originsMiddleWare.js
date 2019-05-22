const { URL } = require("url");
const logger = require("corvid-local-logger");

function originsMiddleware(allowedDomains = []) {
  return (socket, next) => {
    const origin = socket.handshake.headers.origin || "";
    const hostname = origin && new URL(origin).hostname;

    if (!allowedDomains.includes(hostname)) {
      logger.warn(`refused origin [${origin}]`);
      return next(new Error("origin not allowed"));
    }
    logger.warn(`accepted origin [${origin}]`);
    next();
  };
}

module.exports = originsMiddleware;
