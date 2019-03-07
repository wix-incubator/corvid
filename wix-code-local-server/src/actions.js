module.exports = {
    isCloneMode(localServerDriver) {
        // can be an async operation as well
        return new Promise((reslove, reject) => {
            reslove(localServerDriver.isCloneMode())
        })
    },
    getDocument(localServerDriver, data) {
        //todo
        console.log('getDocument')
        return {}
    },
    overrideDocument(localServerDriver, data) {
        //todo
        console.log('overrideDocument')
        return data
    },
    getCode(localServerDriver, data) {
        //todo
        console.log('getCode')
        return {}
    },
    updateCode(localServerDriver, data) {
        //todo
        console.log('updateCode')
        return data
    }
}