const loadEditor = require("@wix/fake-local-mode-editor/src/editor");
const eventually = require("@wix/wix-eventually");
const merge_ = require("lodash/merge");
const localServer = require("../../src/server");
const localSiteDir = require("../utils/localSiteDir");
const lsc = require("@wix/wix-code-local-site/test/utils/localSiteCreators");
const sc = require("@wix/fake-local-mode-editor/src/utils/siteCreators");

describe("edit mode", () => {
  it("should not start the server in edit mode if the site directory is empty", async () => {
    const localSiteFiles = {};

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);

    const server = localServer.startInEditMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_EDIT_EMPTY_SITE");
  });
  it("should send code files to the editor on load", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.publicCode("public-file.json", "public code"),
      lsc.backendCode("sub-folder/backendFile.jsw", "backend code")
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const codeFiles = await editor.getCodeFiles();
    expect(codeFiles).toEqual(
      sc.createPartial(
        sc.publicCode("public-file.json", "public code"),
        sc.backendCode("sub-folder/backendFile.jsw", "backend code")
      )
    );

    await editor.close();
    await server.close();
  });

  it("should send page code files to the editor on load", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.page("page-1"),
      lsc.pageCode("page-1", "public code")
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const codeFiles = await editor.getCodeFiles();
    expect(codeFiles).toEqual(
      sc.createPartial(sc.pageCode("page-1", "public code"))
    );

    await editor.close();
    await server.close();
  });

  it("should send lightbox code files to the editor on load", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.lightbox("lightbox-1"),
      lsc.lightboxCode("lightbox-1", "public code")
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    const codeFiles = await editor.getCodeFiles();
    expect(codeFiles).toEqual(
      sc.createPartial(sc.lightboxCode("lightbox-1", "public code"))
    );

    await editor.close();
    await server.close();
  });

  it("should send site document to the editor on load", async () => {
    const siteParts = {
      page: "page-1",
      colors: "colors-content",
      fonts: "fonts-content",
      theme: "theme-content",
      topLevelStyles: "topLevelStyles-content",
      commonComponents: "commonComponents-content",
      menu: "menu-content",
      multilingualInfo: "multilingualInfo-content",
      siteInfo: "siteInfo-content",
      dataFromMasterPage: "dataFromMasterPage-content",
      version: "version-content",
      revision: "revision-content",
      misc: "misc-content"
    };

    const localSiteFiles = lsc.createFull(
      ...Object.keys(siteParts).map(key => lsc[key](siteParts[key]))
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const siteDocument = await editor.getSiteDocument();

    const expectSiteDocument = sc.createFull(
      ...Object.keys(siteParts).map(key => sc[key](siteParts[key]))
    );

    expect(siteDocument).toEqual(expectSiteDocument);

    await editor.close();
    await server.close();
  });

  it("should send updated site document when user changes page content from the editor and clicks save", async () => {
    const page1ID = "page1";
    const page2ID = "page2";
    const lightBox1ID = "lightBox1ID";

    const localSiteFiles = lsc.createFull(
      lsc.page(page1ID, { content: "page1 old content" }),
      lsc.lightbox(lightBox1ID, { content: "lightBox1ID old content" })
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const newDocument = editor.getSiteDocument();

    // edit existing pages
    newDocument.pages[page1ID].content = "page1 new content";
    newDocument.pages[lightBox1ID].content = "lightBox1ID new content";

    // add new page from the editor
    merge_(newDocument, sc.page(page2ID, { content: "page2 new content" }));

    editor.modifyDocument(newDocument);
    await editor.save();

    const localSiteDocument = await localSiteDir.readLocalSite(localSitePath);

    const expected = lsc.createPartial(
      lsc.page(page2ID, { content: "page2 new content" }),
      lsc.page(page1ID, { content: "page1 new content" }),
      lsc.lightbox(lightBox1ID, {
        content: "lightBox1ID new content"
      })
    );

    expect(localSiteDocument).toMatchObject(expected);

    await editor.close();
    await server.close();
  });

  it("should update code files after editor changes and clicks save", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.publicCode("public-file.json", "public code"),
      lsc.publicCode("public-file1.json", "public code 1"),
      lsc.backendCode("sub-folder/backendFile.jsw", "backend code")
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    editor.modifyCodeFile(
      "backend/authorization-config.json",
      "console.log('authorization-config')"
    );
    editor.deleteCodeFile("public/public-file1.json");
    editor.copyCodeFile(
      "public/public-file.json",
      "public/public-file-copied.json"
    );

    await editor.save();

    const expected = lsc.createPartial(
      lsc.publicCode("public-file.json", "public code"),
      lsc.backendCode("sub-folder/backendFile.jsw", "backend code"),
      lsc.backendCode(
        "authorization-config.json",
        "console.log('authorization-config')"
      )
    );

    const serverFiles = await localSiteDir.readLocalSite(localSitePath);

    expect(serverFiles).toMatchObject(expected);
    // make sure the deleted file is not exsit on the local file system
    expect(serverFiles).not.toMatchObject(
      lsc.publicCode("public/public-file1.json", "public code 1")
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a new code file is added locally", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.publicCode("public-file.json", "public code")
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    await localSiteDir.writeFile(
      localSitePath,
      "public/newFile.js",
      "test content"
    );

    await eventually(
      async () => {
        const codeFiles = await editor.getCodeFiles();
        const expected = sc.createPartial(
          sc.publicCode("public-file.json", "public code"),
          sc.publicCode("newFile.js", "test content")
        );
        expect(codeFiles).toMatchObject(expected);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a code file is modified locally", async () => {
    const filename = "public-file.json";
    const newContent = "updated code file";
    const localSiteFiles = lsc.createFull(
      lsc.publicCode(filename, "public code")
    );
    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);

    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    await localSiteDir.writeFile(
      localSitePath,
      `public/${filename}`,
      newContent
    );

    await eventually(
      async () => {
        const codeFiles = await editor.getCodeFiles();
        const expected = sc.createPartial(sc.publicCode(filename, newContent));
        expect(codeFiles).toMatchObject(expected);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a code file is deleted locally", async () => {
    const localSiteFiles = lsc.createFull(
      lsc.publicCode("public-file.json", "public code"),
      lsc.publicCode("public-file1.json", "public code 1")
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    await localSiteDir.deleteFile(localSitePath, "public/public-file.json");
    await eventually(
      async () => {
        const codeFiles = await editor.getCodeFiles();
        const expected = sc.publicCode("public-file.json", "public code");
        expect(codeFiles).not.toMatchObject(expected);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });
});
