const util = require('util')
const temp = require('temp').track()

const makeTempDir = util.promisify(temp.mkdir)

module.exports = () => makeTempDir('temp')
