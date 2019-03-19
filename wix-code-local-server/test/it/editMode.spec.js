const loadEditor = require("@wix/fake-local-mode-editor");
const eventually = require("@wix/wix-eventually");
const merge_ = require("lodash/merge");
const localServer = require("../../src/server");
const localSiteDir = require("../utils/localSiteDir");
const lsc = require("../utils/localSiteCreators");
const dc = require("../utils/documentCreators");

describe("edit mode", () => {
  it("should not start the server in edit mode if the site directory is empty", async () => {
    const localSiteFiles = {};

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);

    const server = localServer.startInEditMode(localSitePath);

    await expect(server).rejects.toThrow("CAN_NOT_EDIT_EMPTY_SITE");
  });
  it("should send code files to the editor on load", async () => {
    const code1 = {
      path: "public/public-file.json",
      content: "public code"
    };
    const code2 = {
      path: "backend/sub-folder/backendFile.jsw",
      content: "backend code"
    };
    const localSiteFiles = lsc.createFull(
      lsc.code(code1.path, code1.content),
      lsc.code(code2.path, code2.content)
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const codeFiles = await editor.getCodeFiles();
    expect(codeFiles).toEqual(
      lsc.createPartial(
        lsc.code(code1.path, code1.content),
        lsc.code(code2.path, code2.content)
      )
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
      metadata: "metadata-content",
      extraData: {
        version: "version-content",
        seoStuff: "seoStuff-content"
      }
    };

    const localSiteFiles = lsc.createFull(
      ...Object.keys(siteParts).map(key => lsc[key](siteParts[key]))
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const siteDocument = await editor.getSiteDocument();

    const expectSiteDocument = dc.createFull(
      ...Object.keys(siteParts).map(key => dc[key](siteParts[key]))
    );

    expect(siteDocument).toEqual(expectSiteDocument);

    await editor.close();
    await server.close();
  });

  it("should send updated site document when user changes page content from the editor and clicks save", async () => {
    const lightbox = {
      id: "lightBox1ID",
      options: { isPopUp: true, content: "lightBox1ID old content" }
    };
    const page1 = {
      id: "page1",
      options: {
        content: "page1 old content"
      }
    };
    const page2 = {
      id: "page2",
      options: {
        content: "page2 new content"
      }
    };

    const localSiteFiles = lsc.createFull(
      lsc.page(page1.id, page1.options),
      lsc.page(lightbox.id, lightbox.options)
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    const newDocument = editor.getSiteDocument();

    // edit existing pages
    newDocument.pages[page1.id].content = "page1 new content";
    newDocument.pages[lightbox.id].content = "lightBox1ID new content";

    // add new page from the editor
    merge_(newDocument, dc.page(page2.id, page2.options));

    editor.modifyDocument(newDocument);
    await editor.save();

    const localSiteDocument = await localSiteDir.readLocalSite(localSitePath);

    const expected = lsc.createPartial(
      lsc.page(page2.id, page2.options),
      lsc.page(page1.id, { content: "page1 new content" }),
      lsc.page(lightbox.id, {
        isPopUp: true,
        content: "lightBox1ID new content"
      })
    );

    expect(localSiteDocument).toMatchObject(expected);

    await editor.close();
    await server.close();
  });

  it("should update code files after editor changes and clicks save", async () => {
    const code1 = {
      path: "public/public-file.json",
      content: "public code"
    };
    const code2 = {
      path: "public/public-file1.json",
      content: "public code 1"
    };
    const code3 = {
      path: "backend/sub-folder/backendFile.jsw",
      content: "backend code"
    };
    const newCode = {
      path: "backend/authorization-config.json",
      content: "console.log('authorization-config')"
    };
    const copyToPath = "public/public-file-copied.json";

    const localSiteFiles = lsc.createFull(
      lsc.code(code1.path, code1.content),
      lsc.code(code2.path, code2.content),
      lsc.code(code3.path, code3.content)
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);

    editor.modifyCodeFile(newCode.path, newCode.content);
    editor.deleteCodeFile(code2.path);
    editor.copyCodeFile(code1.path, copyToPath);
    await editor.save();

    const expected = lsc.createPartial(
      lsc.code(code1.path, code1.content),
      lsc.code(copyToPath, code1.content),
      lsc.code(code3.path, code3.content),
      lsc.code(newCode.path, newCode.content)
    );

    const serverFiles = await localSiteDir.readLocalSite(localSitePath);
    expect(serverFiles).toMatchObject(expected);
    // make sure the deleted file is not exsit on the local file system
    expect(serverFiles).not.toMatchObject(lsc.code(code2.path, code2.content));

    await editor.close();
    await server.close();
  });

  it("should update the editor when a new code file is added locally", async () => {
    const code1 = {
      path: "public/public-file.json",
      content: "public code"
    };

    const newCode = {
      path: "public/newFile.js",
      content: "test content"
    };
    const localSiteFiles = lsc.createFull(lsc.code(code1.path, code1.content));

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    await localSiteDir.writeFile(localSitePath, newCode.path, newCode.content);

    await eventually(
      async () => {
        const codeFiles = await editor.getCodeFiles();
        const expected = lsc.createPartial(
          lsc.code(code1.path, code1.content),
          lsc.code(newCode.path, newCode.content)
        );
        expect(codeFiles).toMatchObject(expected);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a code file is modified locally", async () => {
    const code1 = {
      path: "public/public-file.json",
      content: "public code"
    };
    const code1NewContent = "updated code file";

    const localSiteFiles = lsc.createFull(lsc.code(code1.path, code1.content));

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    await localSiteDir.writeFile(localSitePath, code1.path, code1NewContent);

    await eventually(
      async () => {
        const codeFiles = await editor.getCodeFiles();
        const expected = lsc.createPartial(
          lsc.code(code1.path, code1NewContent)
        );
        expect(codeFiles).toMatchObject(expected);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });

  it("should update the editor when a code file is deleted locally", async () => {
    const code1 = {
      path: "public/public-file.json",
      content: "public code"
    };
    const code2 = {
      path: "public/public-file1.json",
      content: "public code 1"
    };
    const localSiteFiles = lsc.createFull(
      lsc.code(code1.path, code1.content),
      lsc.code(code2.path, code2.content)
    );

    const localSitePath = await localSiteDir.initLocalSite(localSiteFiles);
    const server = await localServer.startInEditMode(localSitePath);
    const editor = await loadEditor(server.port);
    await localSiteDir.deleteFile(localSitePath, code1.path);
    await eventually(
      async () => {
        const codeFiles = await editor.getCodeFiles();
        const expected = lsc.code(code1.path, code1.content);
        expect(codeFiles).not.toMatchObject(expected);
      },
      { timeout: 3000 }
    );

    await editor.close();
    await server.close();
  });
});
