const fs = require("fs-extra");

const isEmpty = async siteRootPath => {
  const sitePathExists = await fs.exists(siteRootPath);
  const siteContents = sitePathExists ? await fs.readdir(siteRootPath) : [];
  return siteContents.every(item => item.startsWith("."));
};

module.exports = isEmpty;
