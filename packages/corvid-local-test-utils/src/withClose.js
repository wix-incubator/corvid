const toClose = [];

const closeAll = () => {
  toClose.splice(0).forEach(closeIt => closeIt());
};

const add = (fn, closeFuncName = "close") => async (...args) => {
  const closable = await fn(...args);
  const closeIt = () => closable[closeFuncName]();
  toClose.push(closeIt);
  return closable;
};

module.exports = {
  closeAll,
  add
};
