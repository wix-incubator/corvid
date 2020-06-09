const chalk = require("chalk");
const createSpinner = require("../utils/spinner");
const getMessage = require("../messages");
const fetch = require("node-fetch");
const commandWithDefaults = require("../utils/commandWithDefaults");
const { login } = require("./login");
const { readCorvidConfig } = require("../utils/corvid-config");

const basePublicRcUrl =
  "https://www.wix.com/_api/release-manager-server/gradual-rollout";

const getRcInformation = async (metaSiteId, cookie) => {
  return await fetch(`${basePublicRcUrl}?metaSiteId=${metaSiteId}`, {
    headers: {
      accept: "application/json",
      cookie: `${cookie.name}=${cookie.value}`
    },
    method: "GET"
  })
    .then(response => response.json())
    .catch(err => {
      throw err;
    });
};

const createJsonBody = async (metaSiteId, percentage, cookie) => {
  const currentRcInformation = await getRcInformation(metaSiteId, cookie);

  let json = Object.assign({}, currentRcInformation);
  delete json.is_edit_allowed;
  delete json.monitoring_tools_enabled;
  json.revisions.published.percentage = 100 - percentage;
  json.revisions.rc[0].percentage = percentage;
  json.metaSiteId = metaSiteId;

  return json;
};

module.exports = commandWithDefaults({
  command: "rc-exposure",
  describe: getMessage("CreateRc_Command_Description"),
  handler: async args => {
    const spinner = createSpinner();
    const { metasiteId } = await readCorvidConfig(process.cwd());

    if (!metasiteId) {
      spinner.fail(
        getMessage("CorvidConfig_No_Project_Error", {
          dir: process.cwd()
        })
      );
      return;
    }

    if (!args || args["_"].length <= 1) {
      spinner.fail(getMessage("Rc_Exposure_No_Percentage"));
      return;
    }

    return login(spinner, args).then(async cookie => {
      if (cookie) {
        const percentage = args["_"][1];
        const jsonBody = await createJsonBody(metasiteId, percentage, cookie);
        spinner.start(chalk.grey(getMessage("CreateRc_Command_Creating")));
        const options = {
          headers: {
            "content-type": "application/json",
            cookie: `${cookie.name}=${cookie.value}`
          },
          body: jsonBody,
          method: "PUT"
        };

        return await fetch(
          "https://www.wix.com/_api/release-manager-server/gradual-rollout",
          options
        )
          .then(response => {
            if (response.status === 204) {
              spinner.succeed(getMessage("Rc_Exposure_Succeeded"));
            } else {
              spinner.fail(
                `${getMessage("Rc_Exposure_Fail")} (Error ${response.status} ${
                  response.statusText
                })`
              );
            }
          })
          .catch(error => {
            spinner.fail(error);
          });
      }
    });
  }
});
