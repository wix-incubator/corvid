const { socketClient } = require("corvid-local-test-utils");
const { localServer, closeAll } = require("../utils/autoClosing");
const { initLocalSite, readLocalSite } = require("../utils/localSiteDir");
const util = require("util");
const fs = require("fs");
const path = require("path");
const temp = require("temp").track();

const makeTempDir = util.promisify(temp.mkdir);
const exists = util.promisify(fs.exists);
const writeFile = util.promisify(fs.writeFile);

const getEditorEndpoint = server => `http://localhost:${server.port}`;

const clientSocketOptions = {
  transportOptions: {
    polling: {
      extraHeaders: {
        origin: "https://editor.wix.com"
      }
    }
  }
};

afterEach(closeAll);

describe("Security", () => {
  it("should not permit to add file outside of project folder", async done => {
    const tempDirPath = await makeTempDir("test-parent-dir");
    const tempFilePath = path.join(tempDirPath, "test.js");
    const localSiteDir = await initLocalSite(undefined, tempDirPath);
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(
      getEditorEndpoint(server),
      clientSocketOptions
    );
    editorSocket.emit(
      "UPDATE_CODE",
      {
        modifiedFiles: [
          {
            path: "public/../../test.js",
            metaData: {},
            content: "console.log('malicious code')"
          }
        ]
      },
      err => {
        expect(err).toMatchObject({
          message: "tried to access file outside project"
        });
        expect(exists(tempFilePath)).resolves.toEqual(false);
        done();
      }
    );
  });
  it("should not permit to delete file outside of project folder", async done => {
    const tempDirPath = await makeTempDir("test-parent-dir");
    const tempFilePath = path.join(tempDirPath, "test.js");
    await writeFile(tempFilePath, "test");
    const localSiteDir = await initLocalSite(undefined, tempDirPath);
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(
      getEditorEndpoint(server),
      clientSocketOptions
    );
    editorSocket.emit(
      "UPDATE_CODE",
      {
        deletedFiles: [
          {
            path: "public/../../test.js",
            metaData: {}
          }
        ]
      },
      err => {
        expect(err).toMatchObject({
          message: "tried to access file outside project"
        });
        expect(exists(tempFilePath)).resolves.toEqual(true);
        done();
      }
    );
  });
  it("should not permit to copy file from project outside of project folder", async done => {
    const tempDirPath = await makeTempDir("test-parent-dir");
    const tempFilePath = path.join(tempDirPath, "test.js");
    const localSiteDir = await initLocalSite(undefined, tempDirPath);
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(
      getEditorEndpoint(server),
      clientSocketOptions
    );
    editorSocket.emit(
      "UPDATE_CODE",
      {
        modifiedFiles: [
          {
            path: "public/test.js",
            metaData: {},
            content: "console.log('malicious code')"
          }
        ],
        copiedFiles: [
          {
            source: { path: "public/test.js" },
            target: { path: "public/../../test.js" }
          }
        ]
      },
      err => {
        expect(err).toMatchObject({
          message: "tried to access file outside project"
        });
        expect(exists(tempFilePath)).resolves.toEqual(false);
        done();
      }
    );
  });

  it("should not permit to copy file from outside of project into project folder", async done => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(
      getEditorEndpoint(server),
      clientSocketOptions
    );
    editorSocket.emit(
      "UPDATE_CODE",
      {
        modifiedFiles: [
          {
            path: "public/test.js",
            metaData: {},
            content: "console.log('malicious code')"
          }
        ],
        copiedFiles: [
          {
            source: { path: "public/../../test.js" },
            target: { path: "public/test.js" }
          }
        ]
      },
      err => {
        expect(err).toMatchObject({
          message: "tried to access file outside project"
        });
        expect(readLocalSite(localSiteDir)).resolves.toMatchObject({
          public: { "test.js": "console.log('malicious code')" }
        });
        done();
      }
    );
  });
  it("should not permit editor connection with wrong origin", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(
      socketClient.connect(getEditorEndpoint(server))
    ).rejects.toThrow();
  });
});
