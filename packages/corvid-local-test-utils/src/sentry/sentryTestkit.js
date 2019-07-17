"use strict";

const SENTRY_DSN = require("./sentryDSN");
const { parseDsn, createErrorReport } = require("./sentryParser");

const create = nock => {
  let reports = [];

  const { host, protocol, project } = parseDsn(SENTRY_DSN);

  const interceptor = nock(`${protocol}://${host}`)
    .persist()
    .post(uri => uri.indexOf(`/api/${project}/store/`) === 0)
    .reply(200, (_, requestBody) => {
      const report = createErrorReport(requestBody);
      reports.push(report);
    });

  return {
    reports: () => reports.slice(),
    reset: () => {
      reports = [];
    },
    stop: () => {
      nock.removeInterceptor(interceptor);
    }
  };
};

module.exports.create = create;
