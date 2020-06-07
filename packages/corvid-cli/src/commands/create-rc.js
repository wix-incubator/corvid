const _ = require("lodash");
const chalk = require("chalk");
const atob = require("atob");
const createSpinner = require("../utils/spinner");
const { login } = require("./login");
const getMessage = require("../messages");
const fetch = require("node-fetch");
const commandWithDefaults = require("../utils/commandWithDefaults");
const { UserError } = require("corvid-local-logger");
const { readCorvidConfig } = require("../utils/corvid-config");
const fs = require("fs");

const basePublicRcUrl =
  "https://editor.wix.com/html/editor/web/api/publish-rc/";

const parseErrorMessage = errorMessage => {
  if (_.includes(errorMessage, "RC already exists"))
    return getMessage("CreateRc_Command_Already_Exists");

  if (_.includes(errorMessage, "Session not found"))
    return getMessage("CreateRc_Login_Command_Failure");

  return `${getMessage("CreateRc_Command_Failure")}: ${errorMessage}`;
};

const buildFetchUrl = async () => {
  const config = await readCorvidConfig(process.cwd());
  const file = fs.readFileSync("./src/assets/site/siteInfo.wix", {
    encoding: "utf8"
  });
  const decodedContent = atob(JSON.parse(file).content);
  const siteId = JSON.parse(decodedContent).siteId;
  return `${basePublicRcUrl}${siteId}?metaSiteId=${config.metasiteId}`;
};

module.exports = commandWithDefaults({
  command: "create-rc",
  describe: getMessage("CreateRc_Command_Description"),
  handler: args => {
    const spinner = createSpinner();
    spinner.start(chalk.grey(getMessage("CreateRc_Command_Creating")));

    return login(spinner, args)
      .then(async cookie => {
        if (cookie) {
          return await fetch(await buildFetchUrl(), {
            method: "POST",
            headers: {
              cookie: `${cookie.name}=${cookie.value}`
            },
            body: false
          })
            .then(async response => {
              const jsonResponse = await response.json();
              if (jsonResponse.success === true) {
                spinner.succeed(getMessage("CreateRc_Command_Complete"));
                spinner.stop();

                return getMessage("CreateRc_Command_Complete");
              }

              const errorMessage = parseErrorMessage(
                jsonResponse.errorDescription
              );
              spinner.fail(errorMessage);
              return errorMessage;
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
