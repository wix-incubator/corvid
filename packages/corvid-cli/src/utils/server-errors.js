const serverErrors = {
  CAN_NOT_CLONE_NON_EMPTY_SITE:
    "Cannot clone into a directory that isn't empty",
  CAN_NOT_PULL_NON_EMPTY_SITE: "Project already includes site files.",
  CAN_NOT_EDIT_EMPTY_SITE: "Cannot edit an empty site",
  CAN_NOT_CLONE_NON_WIX_SITE:
    "Project not found. Open the Editor in the project's root folder.",
  CAN_NOT_PULL_NON_WIX_SITE:
    "Project not found. Pull site files to the project's root folder.",
  CAN_NOT_EDIT_NON_WIX_SITE:
    "Project not found. Open the Editor in the project's root folder.",
  BACKUP_FOLDER_EXISTS:
    "Something went wrong during last save. Old version of your site is stored in .corvid/backup. Please consolidate your changes and remove backup folder"
};

module.exports = serverErrors;
