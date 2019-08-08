let toClose = [];

const closeAll = async () => {
  await Promise.all(
    toClose.filter(closeIt => !!closeIt).map(closeIt => closeIt())
  );
  toClose = [];
};

const add = (fn, closeFuncName = "close") => async (...args) => {
  const closable = await fn(...args);
  toClose.push(closable[closeFuncName]);
  return closable;
};

module.exports = {
  closeAll,
  add
};
