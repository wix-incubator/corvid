"use strict";

const { parseDsn, createErrorReport } = require("./sentryParser");

const create = (nock, { dsn }) => {
  let reports = [];

  const { host, protocol, project } = parseDsn(dsn);
  const interceptor = nock(`${protocol}://${host}`)
    .persist()
    .filteringRequestBody(/.*/, "*")
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
