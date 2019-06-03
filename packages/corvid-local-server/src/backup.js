const logger = require("corvid-local-logger");
const fs = require("fs-extra");
const projectPaths = require("./projectPaths");
const getMessage = require("./messages");
const dirAsJson = require("corvid-dir-as-json");
const p = require("path");

const backup = async (siteSrcPath, backupPath) => {
  logger.info(getMessage("Backup_Start_log"));
  try {
    await fs.emptyDir(backupPath);
    await fs.copy(siteSrcPath, backupPath);
    logger.info(getMessage("Backup_Complete_log"));
  } catch (e) {
    logger.info(getMessage("Backup_Fail_log"));
    await deleteBackup();
    throw e;
  }
};
const deleteBackup = async backupPath => {
  logger.info(getMessage("Backup_Delete_Start_log"));
  await fs.remove(backupPath);
  logger.info(getMessage("Backup_Delete_Complete_log"));
};

const deleteSrc = async (siteSrcPath, deleteFile) => {
  const siteDirJson = await dirAsJson.readDirToJson(siteSrcPath, {
    delimiter: "/"
  });
  await Promise.all(
    Object.keys(siteDirJson).map(async path => {
      const stats = await fs.stat(p.join(siteSrcPath, path));
      if (!stats.isDirectory()) {
        await deleteFile(path);
      }
    })
  );
  await fs.emptyDir(siteSrcPath);
};

const restore = async (siteSrcPath, backupPath, deleteFile) => {
  logger.info(getMessage("Backup_Restore_Start_log"));
  await deleteSrc(siteSrcPath, deleteFile);
  await fs.move(backupPath, siteSrcPath, { overwrite: true });
  logger.info(getMessage("Backup_Restore_Complete_log"));
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
      await restore(siteSrcPath, backupPath, localSite.deleteFile);
      localSite.resume();
      throw error;
    }
  };
};
module.exports = {
  withBackupInit
};
