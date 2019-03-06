const fs = require('fs-extra')
const chokidar = require('chokidar')

module.exports.localFilesWatcher = (basePath, onChange) => {
    let pause = false
    const setPause = (doPause) => {
        pause = doPause
    }
    fs.ensureDirSync(basePath)
    const watcher = chokidar.watch(basePath)
    return new Promise((resolve, reject) => {
        watcher.on('ready', () => {
            watcher.on('all', (event, path) => {
                if(pause) {
                    return
                }
                if(['add', 'change', 'unlink'].includes(event)){
                    console.log(event, path)
                    onChange(event, path)
                }
            })
            resolve({
                pause: () => setPause(true),
                resume: () => setPause(false),
                close: () => watcher.close()
            })
        })
    })
}