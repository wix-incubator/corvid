const { socketClient, initTempDir } = require("corvid-local-test-utils");
const { localServer, closeAll } = require("../utils/autoClosing");
const {
  localSiteDir: { initLocalSite, readLocalSite }
} = require("corvid-local-testkit");

const fs = require("fs-extra");
const path = require("path");

const { fakeCli: connectCli } = require("../utils/autoClosing");

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
    const tempDirPath = await initTempDir();
    const siteDir = await fs.mkdir(path.join(tempDirPath, "test-site"));
    const tempFilePath = path.join(tempDirPath, "test.js");
    const localSiteDir = await initLocalSite(undefined, siteDir);
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
          message: "Tried to access a file outside of the project"
        });
        expect(fs.exists(tempFilePath)).resolves.toEqual(false);
        done();
      }
    );
  });
  it("should not permit to delete file outside of project folder", async done => {
    const tempDirPath = await initTempDir();
    const siteDir = await fs.mkdir(path.join(tempDirPath, "test-site"));
    const tempFilePath = path.join(tempDirPath, "test.js");
    await fs.writeFile(tempFilePath, "test");
    const localSiteDir = await initLocalSite(undefined, siteDir);
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
          message: "Tried to access a file outside of the project"
        });
        expect(fs.exists(tempFilePath)).resolves.toEqual(true);
        done();
      }
    );
  });
  it("should not permit to copy file from project outside of project folder", async done => {
    const tempDirPath = await initTempDir();
    const siteDir = await fs.mkdir(path.join(tempDirPath, "test-site"));
    const tempFilePath = path.join(tempDirPath, "test.js");
    const localSiteDir = await initLocalSite(undefined, siteDir);
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
          message: "Tried to access a file outside of the project"
        });
        expect(fs.exists(tempFilePath)).resolves.toEqual(false);
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
          message: "Tried to access a file outside of the project"
        });
        expect(readLocalSite(localSiteDir)).resolves.toMatchObject({
          public: { "test.js": "console.log('malicious code')" }
        });
        done();
      }
    );
  });

  it("should not permit editor connection with empty origin", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(
      socketClient.connect(getEditorEndpoint(server))
    ).rejects.toThrow("Origin not allowed");
  });

  it("should not permit editor connection with wrong origin", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(
      socketClient.connect(getEditorEndpoint(server), {
        transportOptions: {
          polling: {
            extraHeaders: {
              origin: "http://wrong.origin.test"
            }
          }
        }
      })
    ).rejects.toThrow("Origin not allowed");
  });
  it("should permit editor connection http origin", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(
      socketClient.connect(getEditorEndpoint(server), {
        transportOptions: {
          polling: {
            extraHeaders: {
              origin: "http://editor.wix.com"
            }
          }
        }
      })
    ).resolves.toMatchObject({ connected: true });
  });

  it("should permit editor connection https origin", async () => {
    const localSiteDir = await initLocalSite();
    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(
      socketClient.connect(getEditorEndpoint(server), {
        transportOptions: {
          polling: {
            extraHeaders: {
              origin: "https://editor.wix.com"
            }
          }
        }
      })
    ).resolves.toMatchObject({ connected: true });
  });

  it("should not allow admin to connect with wrong token", async () => {
    const localSiteDir = await initLocalSite();

    const server = await localServer.startInCloneMode(localSiteDir);
    await expect(connectCli(server.adminPort, "another_token")).rejects.toThrow(
      "Authentication error"
    );
  });

  it("should allow admin to connect with correct token", async () => {
    const localSiteDir = await initLocalSite();

    const server = await localServer.startInCloneMode(localSiteDir);
    const cli = await connectCli(server.adminPort, server.adminToken);
    expect(cli.isConnected()).toBe(true);
  });
});
