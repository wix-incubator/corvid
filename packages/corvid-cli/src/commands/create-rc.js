const _ = require("lodash");
const chalk = require("chalk");
const createSpinner = require("../utils/spinner");
const { login } = require("./login");
const getMessage = require("../messages");
const fetch = require("node-fetch");
const commandWithDefaults = require("../utils/commandWithDefaults");

// const basePublicRcUrl =
//   "https://editor.wix.com/html/editor/web/api/publish-rc/";
// Format of the URL should be [BASE_PUBLIC_RC_URL]/[SITE_ID]?editorSessionId=[EDITOR_SESSION_ID]&esi=[EDITOR_SESSION_ID]&metaSiteId=[META_SITE_ID]
// constructUrl(
//   sessionData.siteName,
//   sessionData.editorSessionId,
//   sessionData.metaSiteId
// ),

// TEMPLATE OF A RESPONSE
//           {
//   "errorCode": -10154,
//   "errorDescription": "[business][RECOVERABLE][Public Html API Service] c.w.h.a.e.UniqueRcViolationException - Site id: 752363f1-e7f0-4c91-a095-1cba36e11d42 RC already exists",
//   "success": false
// }

/**
 * @param  {string} siteId
 * @param  {string} editorSessionId
 * @param  {string} metaSiteId
 * @returns {string} URL of the call to publish an RC
 */
// const constructUrl = (siteId, editorSessionId, metaSiteId) =>
//   `${basePublicRcUrl}/${siteId}/?editorSessionId=${editorSessionId}&esi=${editorSessionId}&metaSiteId=${metaSiteId}`;

const getOptions = cookie => {
  return {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9,he;q=0.8,es;q=0.7,tr;q=0.6",
      "cache-control": "no-cache",
      authorization: cookie,
      "content-type": "application/json; charset=utf-8",
      pragma: "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-editor-session-id": "bbaebee4-b871-475c-8339-3ad970b02280",
      "x-wix-ds-origin": "Editor1.4",
      "x-wix-editor-version": "new",
      "x-xsrf-token": "1591004709|UTylQAxnWkV7"
    },
    referrer:
      "https://editor.wix.com/html/editor/web/renderer/render/document/752363f1-e7f0-4c91-a095-1cba36e11d42?isEdited=true&isEditor=true&isSantaEditor=true&dsOrigin=Editor1.4&controllersUrlOverride=&lang=en&metaSiteId=5dc7ce18-892a-4cdc-8ff5-b916f1bf856b&editorSessionId=bbaebee4-b871-475c-8339-3ad970b02280&esi=bbaebee4-b871-475c-8339-3ad970b02280&languages=",
    referrerPolicy: "no-referrer-when-downgrade",
    body: '{"viewerName":"bolt"}',
    method: "POST",
    mode: "cors",
    credentials: "include"
  };
};

const parseErrorMessage = errorMessage => {
  if (_.includes(errorMessage, "RC already exists"))
    return getMessage("CreateRc_Command_Already_Exists");

  if (_.includes(errorMessage, "Session not found"))
    return getMessage("CreateRc_Login_Command_Failure");

  return getMessage("CreateRc_Command_Failure");
};

module.exports = commandWithDefaults({
  command: "create-rc",
  describe: getMessage("CreateRc_Command_Description"),
  handler: args => {
    const fetchUrl = args.dir;
    const spinner = createSpinner();
    // TODO: Don't forget to add a create-rc event BI reporter
    spinner.start(chalk.grey(getMessage("CreateRc_Command_Creating")));

    return login(spinner, args).then(async cookie => {
      if (cookie) {
        await fetch(fetchUrl, getOptions(cookie.value))
          .then(async response => {
            const jsonResponse = await response.json();
            // console.log(parseErrorMessage(jsonResponse.errorDescription));
            if (jsonResponse.success === true) {
              spinner.succeed(getMessage("CreateRc_Command_Complete"));
            } else {
              spinner.fail(parseErrorMessage(jsonResponse.errorDescription));
            }
          })
          .catch(response => {
            spinner.fail(parseErrorMessage(response.errorDescription));
          });
      }
    });
  }
});
