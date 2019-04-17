const { socketClient } = require("corvid-local-test-utils");
const { localServer, closeAll } = require("../utils/autoClosing");
const { initLocalSiteWithConfig } = require("../utils/localSiteDir");

const getEditorEndpoint = server => `http://localhost:${server.port}`;

afterEach(closeAll);

describe("Security", () => {
  it("should not permit to add file outside of project folder", async done => {
    const localSiteDir = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(getEditorEndpoint(server));
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
          message: "tried to write outside of project"
        });
        done();
      }
    );
  });
  it("should not permit to delete file outside of project folder", async done => {
    const localSiteDir = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(getEditorEndpoint(server));
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
          message: "tried to delete outside of project"
        });
        done();
      }
    );
  });
  it("should not permit to copy file from project outside of project folder", async done => {
    const localSiteDir = await initLocalSiteWithConfig();
    const server = await localServer.startInCloneMode(localSiteDir);
    const editorSocket = await socketClient.connect(getEditorEndpoint(server));
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
            sourcePath: "public/test.js",
            targetPath: "public/../../test.js"
          }
        ]
      },
      err => {
        expect(err).toMatchObject({
          message: "tried to copy outside of project"
        });
        done();
      }
    );
  });
});
