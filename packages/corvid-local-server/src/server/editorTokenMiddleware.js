const logger = require("corvid-local-logger");
const getMessage = require("../messages");
function editorTokenMiddleware(editorToken) {
  return (socket, next) => {
    if (socket.handshake.query.token === editorToken) {
      return next();
    }
    logger.warn(getMessage("EditorToken_Error_Log"));
    return next(new Error(getMessage("EditorToken_Error")));
  };
}

module.exports = editorTokenMiddleware;
