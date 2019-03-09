const sitePaths = require("./sitePaths");

const readWrite = filesWatcher => ({
  overrideDocument: async newDocument => {
    const newPages = newDocument.pages;
    if (newPages) {
      const newPageWrites = Object.keys(newPages).map(pageId => {
        return filesWatcher.ignoredWriteFile(
          sitePaths.page(pageId),
          newPages[pageId]
        );
      });
      await Promise.all(newPageWrites);
    }
  }
});

module.exports = readWrite;
