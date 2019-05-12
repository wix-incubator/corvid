const logger = require("corvid-local-logger");
function adminTokenMiddleware(adminToken) {
  return (socket, next) => {
    if (socket.handshake.query.token === adminToken) {
      return next();
    }
    logger.warn("admin server authentication error");
    return next(new Error("authentication error"));
  };
}

module.exports = adminTokenMiddleware;
