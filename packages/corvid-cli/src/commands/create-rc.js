const _ = require("lodash");
const chalk = require("chalk");
const createSpinner = require("../utils/spinner");
const { login } = require("./login");
const getMessage = require("../messages");
const fetch = require("node-fetch");
const commandWithDefaults = require("../utils/commandWithDefaults");
const { UserError } = require("corvid-local-logger");
const { readCorvidConfig } = require("../utils/corvid-config");

const basePublicRcUrl =
  "https://editor.wix.com/html/editor/web/api/publish-rc/";

const parseErrorMessage = errorMessage => {
  if (_.includes(errorMessage, "RC already exists"))
    return getMessage("CreateRc_Command_Already_Exists");

  if (_.includes(errorMessage, "Session not found"))
    return getMessage("CreateRc_Login_Command_Failure");

  return `${getMessage("CreateRc_Command_Failure")}: ${errorMessage}`;
};

module.exports = commandWithDefaults({
  command: "create-rc",
  describe: getMessage("CreateRc_Command_Description"),
  handler: args => {
    const spinner = createSpinner();

    spinner.start(chalk.grey(getMessage("CreateRc_Command_Creating")));

    // TODO: Don't forget to add a create-rc event BI reporter
    return login(spinner, args)
      .then(async cookie => {
        const currentProjectPath = process.cwd();
        const corvidConfig = await readCorvidConfig(currentProjectPath);
        const fetchUrl = basePublicRcUrl + corvidConfig.metasiteId;

        if (cookie) {
          return await fetch(fetchUrl, {
            method: "POST",
            headers: {
              cookie: `${cookie.name}=${cookie.value};`
            }
          })
            .then(async response => {
              const jsonResponse = await response.json();
              if (jsonResponse.success === true) {
                spinner.succeed(getMessage("CreateRc_Command_Complete"));
                spinner.stop();

                return getMessage("CreateRc_Command_Complete");
              }

              spinner.fail(parseErrorMessage(jsonResponse.errorDescription));
              return parseErrorMessage(jsonResponse.errorDescription);
            })
            .catch(error => {
              throw new UserError(parseErrorMessage(error));
            });
        }
      })
      .catch(error => {
        spinner.fail();
        throw error;
      });
  }
});
