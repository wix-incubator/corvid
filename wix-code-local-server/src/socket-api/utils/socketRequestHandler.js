const handleRequest = handler => (...args) => {
  // TODO: properly handle different arg possibilities
  const callback = args.pop() || (() => {});
  const payload = args.pop();
  return Promise.resolve(handler(payload))
    .then(result => callback(null, result))
    .catch(err => callback(err));
};

const createSocketRequestHandler = requestMap => socket => {
  Object.keys(requestMap).forEach(event => {
    socket.on(event, handleRequest(requestMap[event]));
  });
};

module.exports = createSocketRequestHandler;
