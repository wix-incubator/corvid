const logger = require("corvid-local-logger");
const fs = require("fs-extra");
const projectPaths = require("./projectPaths");

const backup = async (siteSrcPath, backupPath) => {
  logger.info("Backing up site");
  try {
    await fs.emptyDir(backupPath);
    await fs.copy(siteSrcPath, backupPath);
    logger.info("Backing up site complete");
  } catch (e) {
    logger.info("Backing up site is failed");
    await deleteBackup();
    throw e;
  }
};
const deleteBackup = async backupPath => {
  logger.info("Deleting backup");
  await fs.remove(backupPath);
  logger.info("Deleting backup complete");
};
const restore = async (siteSrcPath, backupPath) => {
  logger.info("Restoring site from backup");
  await fs.emptyDir(siteSrcPath);
  await fs.move(backupPath, siteSrcPath, { overwrite: true });
  logger.info("Restoring site from backup complete");
};

const withBackupInit = (rootPath, localSite) => {
  const siteSrcPath = projectPaths.siteSrcPath(rootPath);
  const backupPath = projectPaths.backupPath(rootPath);
  return asyncCallback => async (...args) => {
    await backup(siteSrcPath, backupPath);
    try {
      const result = await asyncCallback(...args);
      await deleteBackup(backupPath);
      return result;
    } catch (error) {
      logger.error(error.message);
      localSite.pause();
      await restore(siteSrcPath, backupPath);
      localSite.resume();
      throw error;
    }
  };
};
module.exports = {
  withBackupInit
};
