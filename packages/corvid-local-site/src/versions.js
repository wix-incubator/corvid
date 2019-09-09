const path = require("path");
const fs = require("fs-extra");
const { DEFAULT_FILE_PATHS } = require("./sitePaths");

const readFileSystemLayoutVersion = async siteRootPath => {
  const metadataPath = path.join(siteRootPath, DEFAULT_FILE_PATHS.METADATA);
  if (await fs.exists(metadataPath)) {
    const siteMetadata = await fs.readJson(metadataPath);
    return siteMetadata.localFileSystemLayout;
  }
};

module.exports = {
  supportedSiteDocumentVersion: "1.0",
  localFileSystemLayout: "2.0",
  readFileSystemLayoutVersion
};
