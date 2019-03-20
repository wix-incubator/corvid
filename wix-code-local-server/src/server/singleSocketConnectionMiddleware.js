function singleSocketConnectionMiddleware() {
  let connections = 0;
  return (socket, next) => {
    if (connections > 0) {
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
