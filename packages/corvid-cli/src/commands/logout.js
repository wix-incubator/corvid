const path = require("path");
const chalk = require("chalk");
const { launch } = require("../utils/electron");
const createSpinner = require("../utils/spinner");
const getMessage = require("../messages");
const commandWithDefaults = require("../utils/commandWithDefaults");

module.exports = commandWithDefaults({
  command: "logout",
  describe: getMessage("Logout_Command_Description"),
  handler: () => {
    const spinner = createSpinner();
    spinner.start(chalk.grey(getMessage("Logout_Command_Clearing")));

    return launch(path.join(__dirname, "../electron/logout")).then(() => {
      spinner.succeed(chalk.grey(getMessage("Logout_Command_Cleared")));
    });
  }
});
