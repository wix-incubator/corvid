const { prettyStringify } = require("./prettify");
const isString_ = require("lodash/isString");
const flow_ = require("lodash/flow");
const atob = require("atob");
const btoa = require("btoa");

const showRealJson = process.env.XPERT;

const decodeContent = payload => {
  const decode = flow_([atob, escape, decodeURIComponent, JSON.parse]);
  return isString_(payload)
    ? decode(payload)
    : { ...payload, content: decode(payload.content) };
};
const encodeContent = content => {
  const encode = flow_([JSON.stringify, encodeURIComponent, unescape, btoa]);
  return !content.content
    ? encode(content)
    : { ...content, content: encode(content.content) };
};

const toWixFileContent = (content, documentSchemaVersion) => {
  content = showRealJson ? decodeContent(content) : content;
  return prettyStringify({
    content,
    documentSchemaVersion
  });
};

const fromWixFileContent = wixFileContent => {
  const fileAsJson = JSON.parse(wixFileContent);
  return !showRealJson
    ? fileAsJson
    : { ...fileAsJson, content: encodeContent(fileAsJson.content) };
};

module.exports = {
  toWixFileContent,
  fromWixFileContent
};
