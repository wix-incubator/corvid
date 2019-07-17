"use strict";

const dsnKeys = "source protocol user pass host port path".split(" ");
const dsnPattern = /^(?:(\w+):)?\/\/(?:(\w+)(:\w+)?@)?([\w\.-]+)(?::(\d+))?(\/.*)/; //eslint-disable-line no-useless-escape

const parseDsn = dsn => {
  const { protocol, host, path } = dsn.match(dsnPattern).reduce(
    (parsed, current, index) =>
      Object.assign({}, parsed, {
        [dsnKeys[index]]: current
      }),
    {}
  );

  const project = path.substr(path.lastIndexOf("/") + 1);

  return { protocol, project, host };
};

const createErrorReport = request => {
  const error =
    request.exception &&
    request.exception.values &&
    request.exception.values[0];

  return {
    level: request.level || "error",
    release: request.release,
    tags: request.tags,
    extra: request.extra,
    breadcrumbs: request.breadcrumbs || [],
    user: request.user,
    message: error ? error.value : request.message,
    error: error
      ? {
          type: error.type,
          message: error.value,
          stacktrace: error.stacktrace.frames
        }
      : null
  };
};

module.exports.parseDsn = parseDsn;
module.exports.createErrorReport = createErrorReport;
