const logger = require("corvid-local-logger");
const getMessage = require("./messages");
function adminTokenMiddleware(adminToken) {
  return (socket, next) => {
    if (socket.handshake.query.token === adminToken) {
      return next();
    }
    logger.warn(getMessage("AdminToken_Error_Log"));
    return next(new Error(getMessage("AdminToken_Error")));
  };
}

module.exports = adminTokenMiddleware;
