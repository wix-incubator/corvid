const logger = require("corvid-local-logger");
function originsMiddleware(allowedDomains) {
  return (socket, next) => {
    const origin = socket.handshake.headers.origin || "";
    let hostname = origin.replace(/^https?:\/\//, "");
    const isTesting =
      process.env.NODE_ENV === "test" && hostname === "localhost:3000";
    if (!isTesting && allowedDomains && !allowedDomains.includes(hostname)) {
      logger.warn(`refused origin [${origin}]`);
      return next(new Error("origin not allowed"));
    }
    logger.warn(`accepted origin [${origin}]`);
    next();
  };
}

module.exports = originsMiddleware;
