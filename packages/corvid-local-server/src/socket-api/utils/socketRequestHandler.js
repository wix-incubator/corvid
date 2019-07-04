const logger = require("corvid-local-logger");

const handleSocketEvent = async (
  handler,
  event,
  payload,
  callback = () => {}
) => {
  logger.info(`Socket event ${event} received`);
  try {
    const result = await handler(payload);
    callback(null, result);
    return result;
  } catch (err) {
    logger.error(err);
    callback({
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }
};

const createSocketRequestHandler = requestMap => socket => {
  Object.keys(requestMap).forEach(event => {
    socket.on(event, (...args) => {
      const handler = requestMap[event];
      const callback = args.pop() || (() => {});
      const payload = args.pop();
      handleSocketEvent(handler, event, payload, callback);
    });
  });
};

module.exports = createSocketRequestHandler;
