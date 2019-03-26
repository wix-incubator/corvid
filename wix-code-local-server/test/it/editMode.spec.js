const eventually = require("@wix/wix-eventually");
const {
  editor: loadEditor,
  editorSiteBuilder
} = require("@wix/fake-local-mode-editor");
const { localSiteBuilder } = require("@wix/wix-code-local-site/testkit");
const { siteCreators: sc } = require("@wix/wix-code-local-test-utils");
const merge_ = require("lodash/merge");
const localServer = require("../../src/server");
const localSiteDir = require("../utils/localSiteDir");

describe("edit mode", () => {
  it("should not start the server in edit mode if the site directory is empty", async () => {
    const localSiteFiles = {};

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);

    const server = localServer.startInEditMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_EDIT_EMPTY_SITE");
  });

  it("should send code files to the editor on load", async () => {
    const siteItems = [sc.publicCode(), sc.backendCode()];

    const localSiteFiles = localSiteBuilder.buildFull(...siteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const editorSite = await editor.getSite();
    expect(editorSite).toMatchObject(
      editorSiteBuilder.buildPartial(...siteItems)
    );

    await editor.close();
    await server.close();
  });

  it("should send page code files to the editor on load", async () => {
    const pageWithCode = sc.pageWithCode();

    const localSiteFiles = localSiteBuilder.buildFull(pageWithCode);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const expectedEditorSite = editorSiteBuilder.buildPartial(pageWithCode);
    expect(editorSite).toMatchObject(expectedEditorSite);

    await editor.close();
    await server.close();
  });

  it("should send lightbox code files to the editor on load", async () => {
    const lightBoxWithCode = sc.lightboxWithCode();

    const localSiteFiles = localSiteBuilder.buildFull(lightBoxWithCode);
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);

    const editor = await loadEditor(server.port);
    const editorSite = await editor.getSite();
    const expectedEditorSite = editorSiteBuilder.buildPartial(lightBoxWithCode);

    expect(editorSite).toMatchObject(expectedEditorSite);

    await editor.close();
    await server.close();
  });

  it("should send site document to the editor on load", async () => {
    const siteItems = [
      sc.page(),
      sc.lightbox(),
      sc.styles(),
      sc.site(),
      sc.router()
    ];

    const localSiteFiles = localSiteBuilder.buildFull(...siteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const editorSite = await editor.getSite();

    const expectedSite = editorSiteBuilder.buildFull(...siteItems);

    expect(editorSite).toMatchObject(expectedSite);

    await editor.close();
    await server.close();
  });

  it("should send updated site document when user changes page content from the editor and clicks save", async () => {
    const existingSiteItems = [
      sc.page({ pageId: "page1", content: "existing content" }),
      sc.lightbox({
        pageId: "lightbox1",
        content: "existing content"
      })
    ];

    const localSiteFiles = localSiteBuilder.buildFull(...existingSiteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const editorSite = editor.getSite();

    const updatedSiteItems = [
      sc.page({ pageId: "page1", content: "modified content" }),
      sc.lightbox({
        pageId: "lightbox1",
        content: "modified content"
      }),
      sc.page({ pageId: "page2" }) //  new page
    ];

    const siteUpdates = editorSiteBuilder.buildPartial(...updatedSiteItems);
    editor.modifyDocument(merge_({}, editorSite, siteUpdates).siteDocument);

    await editor.save();

    const localSite = await localSiteDir.readLocalSite(localSitePath);

    const expectedLocalSite = localSiteBuilder.buildPartial(
      ...updatedSiteItems
    );

    expect(localSite).toMatchObject(expectedLocalSite);

    await editor.close();
    await server.close();
  });

  // todo:: split this test to 6 test, (modify pageCode & regular code), (delete pageCode & regular code), (copy pageCode & regular code)
  it("should update code files after editor changes and clicks save", async () => {
    const siteItems = [
      sc.pageWithCode({ pageId: "page-1" }, "page code"),
      sc.publicCode("public-file.json", "public code"),
      sc.publicCode("public-file1.json", "public code 1"),
      sc.backendCode("sub-folder/backendFile.jsw", "backend code")
    ];

    const localSiteFiles = localSiteBuilder.buildFull(...siteItems);

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    editor.modifyCodeFile(
      "backend/authorization-config.json",
      "console.log('authorization-config')"
    );

    editor.modifyCodeFile("public/pages/page-1.js", "code file options8888");
    editor.deleteCodeFile("public/public-file1.json");
    editor.copyCodeFile(
      "public/public-file.json",
      "public/public-file-copied.json"
    );

    await editor.save();

    const expected = localSiteBuilder.buildPartial(
      sc.pageWithCode({ pageId: "page-1" }, "code file options8888"),
      sc.publicCode("public-file.json", "public code"),
      sc.backendCode("sub-folder/backendFile.jsw", "backend code"),
      sc.backendCode(
        "authorization-config.json",
        "console.log('authorization-config')"
      )
    );

    const serverFiles = await localSiteDir.readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expected);
    expect(serverFiles).not.toMatchObject(
      sc.publicCode("public/public-file1.json", "public code 1")
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a new code file is added locally", async () => {
    const localSitePath = await localSiteDir.initLocalSite(
      localSiteBuilder.buildFull()
    );
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    await localSiteDir.writeFile(
      localSitePath,
      "public/newFile.js",
      "test content"
    );

    await eventually(
      async () => {
        const editorSite = await editor.getSite();
        const expectedEditorSite = editorSiteBuilder.buildPartial(
          sc.publicCode("newFile.js", "test content")
        );
        expect(editorSite).toMatchObject(expectedEditorSite);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a code file is modified locally", async () => {
    const publicCode = sc.publicCode();

    const localSiteFiles = localSiteBuilder.buildFull(publicCode);
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);

    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    await localSiteDir.writeFile(localSitePath, publicCode.path, "new content");

    await eventually(
      async () => {
        const editorSite = await editor.getSite();
        const expectedEditorSite = editorSiteBuilder.buildPartial(
          Object.assign(publicCode, { content: "new content" })
        );
        expect(editorSite).toMatchObject(expectedEditorSite);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a code file is deleted locally", async () => {
    const file1 = sc.publicCode("public-file.json", "public code");
    const file2 = sc.publicCode("public-file1.json", "public code 1");

    const localSiteFiles = localSiteBuilder.buildFull(file1, file2);
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    await localSiteDir.deleteFile(localSitePath, file1.path);

    await eventually(
      async () => {
        const editorSite = await editor.getSite();
        expect(editorSite).not.toMatchObject(
          editorSiteBuilder.buildPartial(file1)
        );
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });
});
