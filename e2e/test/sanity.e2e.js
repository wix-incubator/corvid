const execa = require('execa');
const fs = require('fs-extra');
const tempy = require('tempy');

const { publish } = require('../utils/publish');
const { registry } = require('../utils/registry');

const EXIT_CODE_SUCCESS = 0;
const testSites = ['https://editor.wix.com/html/editor/web/renderer/edit/1b5fdec1-6178-469f-84a6-e8c4968175a4?metaSiteId=47450a3c-636f-43a3-b048-86b10f330316&editorSessionId=e16e8384-5e0f-5af0-a479-d113307f0db3']

describe("sanity e2e", () => {
    let cleanup;
    let tempDirectory;

    beforeEach(() => {
        process.env['npm_config_registry'] = registry;
        tempDirectory = tempy.directory();
    });
    
    afterEach(() => {
        fs.removeSync(tempDirectory);
    })

    beforeAll(() => {
        cleanup = publish();
    })
    afterAll(() => {
        cleanup();
    })

    it('should generate new corvid project successfully', async () => {
        process.chdir(tempDirectory);
        const initCorvidCmd = execa.shellSync(`npx init-corvid ${tempDirectory}`);
        expect(initCorvidCmd.code).toEqual(EXIT_CODE_SUCCESS)
        expect(initCorvidCmd.stdout).toContain('Done!')
        const corvidCloneCmd = await execa.shellSync(`npx corvid clone ${testSites[0]}`);
        expect(corvidCloneCmd.code).toEqual(EXIT_CODE_SUCCESS);
        expect(corvidCloneCmd.stdout).toContain(`Clone complete, run 'corvid open-editor' to start editing the local copy`);
        const openEditorCmd = await execa.shellSync('npx corvid open-editor');
        expect(openEditorCmd.code).toEqual(EXIT_CODE_SUCCESS);
        // TODO: interact with electron
    })
})