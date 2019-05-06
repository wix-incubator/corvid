function originsMiddleware(allowedDomains, onBlock, onAccept) {
  return (socket, next) => {
    const origin = socket.handshake.headers.origin || "";
    let hostname = origin.replace(/^https?:\/\//, "");
    if (allowedDomains && !allowedDomains.includes(hostname)) {
      onBlock(origin);
      return next(new Error("origin not allowed"));
    }
    onAccept(origin);
    next();
  };
}

module.exports = originsMiddleware;
