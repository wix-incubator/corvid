const decodeBase64 = encoded =>
  Buffer.from(encoded, "base64").toString("ascii");

module.exports = {
  decode: decodeBase64
};
