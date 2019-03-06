const fs = require('fs-extra')

module.exports.writeFilesSync = (path, filesContent, options = { spaces: 2, encoding: 'utf8' }) => {
    filesContent.forEach(content => {
        writeFileSync(path, content, options)
    })
}

module.exports.writeFileSync = (path, content, options = { spaces: 2, encoding: 'utf8' }) => {
    fs.writeJsonSync(path, content, options)
}
