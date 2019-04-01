function singleSocketConnectionMiddleware(onBlock) {
  let connections = 0;
  return (socket, next) => {
    if (connections > 0) {
      onBlock();
      return next(new Error("ONLY_ONE_CONNECTION_ALLOWED"));
    }
    connections++;
    socket.on("disconnect", () => {
      connections--;
    });
    return next();
  };
}

module.exports = singleSocketConnectionMiddleware;
