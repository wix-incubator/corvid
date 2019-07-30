const pick_ = require("lodash/pick");

const overrideEnv = (overrides = {}) => {
  const originalEnv = pick_(process.env, Object.keys(overrides));
  Object.assign(process.env, overrides);
  return () => {
    Object.assign(process.env, originalEnv);
  };
};

module.exports = overrideEnv;
