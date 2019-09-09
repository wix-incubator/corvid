const createQueue = () => {
  let readyPromise = Promise.resolve();

  const runWhenReady = callback => (...args) =>
    new Promise((resolve, reject) => {
      const runCallback = () => callback(...args).then(resolve, reject);
      readyPromise = readyPromise.then(runCallback);
    });

  return runWhenReady;
};

module.exports = createQueue;
