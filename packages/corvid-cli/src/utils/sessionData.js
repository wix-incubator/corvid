let sessionData = Object.create(null);
const callbacks = new Set([]);

const has = key => sessionData[key] !== undefined;
const getKey = key => sessionData[key];
const callWithKeys = (fn, ...keys) => {
  const args = keys.map(getKey);
  if (args.every(arg => arg !== undefined)) return fn(...args);
};

module.exports = {
  reset: () => (sessionData = Object.create(null)),
  has,
  set: async data => {
    sessionData = Object.assign({}, sessionData, data);

    await Promise.all(
      Array.from(callbacks).map(async callback => {
        const [keys, cb] = callback;
        if (keys.every(has)) {
          callbacks.delete(callback);
          await callWithKeys(cb, ...keys);
        }
      })
    );

    return sessionData;
  },
  get: () => sessionData,
  getKey,
  callWithKeys,
  on: async (keys, cb) => {
    if (keys.every(has)) {
      return callWithKeys(cb, ...keys);
    } else {
      callbacks.add([keys, cb]);
    }
  }
};
