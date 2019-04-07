"use strict";

const path = require("path");
const _ = require("lodash");

const fs = jest.genMockFromModule("fs");

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = {};
    }
    mockFiles[dir][path.basename(file)] = newMockFiles[file];
  }
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(directoryPath) {
  return Object.keys(mockFiles[directoryPath] || {});
}

function readFileSync(filename) {
  return _.get(mockFiles, [path.dirname(filename), path.basename(filename)]);
}

function writeFile(file, contents, cb) {
  cb();
}

fs.__setMockFiles = __setMockFiles;
fs.readdirSync = readdirSync;
fs.readFileSync = readFileSync;
fs.writeFile = writeFile;

module.exports = fs;
