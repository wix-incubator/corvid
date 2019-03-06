const driver = require('./driver')
const eventually = require('@wix/wix-eventually')
const filesManagerCreator = require('../src/filesManager')
const basePath = driver.getBasePath()
describe('files', () => {
    beforeEach((done) => {
        driver.clearBasePath(done)
    })
    afterAll(() => {
        driver.clearBasePath()
    })
    it('should create file from recieved data', () => {
        const filesManager = filesManagerCreator(basePath)
        const result = filesManager.save({
            modifiedFiles: {
                'public/test1.js': 'console.log("test1")'
            },
            copiedFiles: [],
            deletedFiles: []
        })
        expect(result.success).toBe(true)
        expect(driver.filesManager.fileExists('public/test1.js')).toBe(true)
        expect(driver.filesManager.fileContent('public/test1.js'))
            .toBe('console.log("test1")')
    })
    it('should return correct files data for files hierarchy', () => {
        const filesManager = filesManagerCreator(basePath)
        filesManager.save(driver.filesManager.defaultDirectoryStructure)
        const data = filesManager.get()
        expect(data).toEqual({
            "backend/authorization-config.json": "console.log(\"authorization-config\")",
            "backend/routers.json": "console.log(\"routers\")",
            "public/public-code-file-1.js": "console.log(\"public-code-file-1\")",
            "public/public-code-file-2.js": "console.log(\"public-code-file-2\")",
        })
    })
    it('should copy file from recieved data', () => {
        const filesManager = filesManagerCreator(basePath)
        filesManager.save(driver.filesManager.defaultDirectoryStructure)
        filesManager.save({
            modifiedFiles: {},
            copiedFiles: [{sourcePath: 'public/public-code-file-2.js', targetPath: 'public/public-code-file-2-copied.js'}],
            deletedFiles: []
        })
        const data = filesManager.get()
        expect(data).toEqual({
            "backend/authorization-config.json": "console.log(\"authorization-config\")",
            "backend/routers.json": "console.log(\"routers\")",
            "public/public-code-file-1.js": "console.log(\"public-code-file-1\")",
            "public/public-code-file-2.js": "console.log(\"public-code-file-2\")",
            "public/public-code-file-2-copied.js": "console.log(\"public-code-file-2\")",
        })
    })
    it('should delete file from recieved data', () => {
        const filesManager = filesManagerCreator(basePath)
        filesManager.save(driver.filesManager.defaultDirectoryStructure)
        filesManager.save({
            modifiedFiles: {},
            copiedFiles: [],
            deletedFiles: ['public/public-code-file-2.js']
        })
        const data = filesManager.get()
        expect(data).toEqual({
            "backend/authorization-config.json": "console.log(\"authorization-config\")",
            "backend/routers.json": "console.log(\"routers\")",
            "public/public-code-file-1.js": "console.log(\"public-code-file-1\")",
        })
    })

    
})