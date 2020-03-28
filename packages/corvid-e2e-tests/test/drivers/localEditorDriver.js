/* eslint-disable no-console */
const { byAid } = require("./utils");

const PUSH_BUTTON_SELECTOR = byAid("top-bar-button-local-push");
const SAVE_LOCAL_BUTTON_SELECTOR = byAid("top-bar-button-save");
const SAVE_LOCAL_IN_PROGRESS = `${SAVE_LOCAL_BUTTON_SELECTOR}.top-bar-btn-in-progress-indicator`;
const SAVE_LOCAL_SUCCESS = `${SAVE_LOCAL_BUTTON_SELECTOR}.top-bar-btn-done-successfully`;
const ADD_ELEMENT_SELECTOR = ".add-panel";
const ADD_TEXT_SELECTOR = ".add-panel-category-list .text .control-label-base";
const THEMED_TEXTS_SELECTOR =
  '[data-section-title="Themed Text"] .live-text span';

module.exports = page => {
  const waitForEditor = () =>
    page.waitForSelector(PUSH_BUTTON_SELECTOR, { timeout: 30000 });

  const waitForLoginForm = () => page.waitForSelector(".log-in-title");

  const close = async () => await page.close();

  const push = async () => await page.click(PUSH_BUTTON_SELECTOR);

  const saveLocal = async () => {
    await page.click(SAVE_LOCAL_BUTTON_SELECTOR);
    await page.waitForSelector(SAVE_LOCAL_IN_PROGRESS);
    await page.waitForSelector(SAVE_LOCAL_SUCCESS);
  };

  const addTextElement = async () => {
    await page.click(ADD_ELEMENT_SELECTOR);
    await page.waitForSelector(ADD_TEXT_SELECTOR);
    await page.hover(ADD_TEXT_SELECTOR);
    await page.waitForSelector(THEMED_TEXTS_SELECTOR);
    const textElements = await page.$(THEMED_TEXTS_SELECTOR);
    await textElements.click();
  };

  const login = async ({ username, password }) => {
    console.log("(login driver) awaiting email input");
    const emaiInput = await page.$("#input_0");
    console.log("(login driver) typing email");
    await emaiInput.type(username);
    console.log("(login driver) searching for #input_1");
    const isNewLoginPage = !(await page.$("#input_1"));
    if (isNewLoginPage) {
      console.log(
        "(login driver) IS NEW LOGIN PAGE - looking for CONTINUE button"
      );
      const continueButton = await page.$(".login-btn");
      console.log("(login driver) clicking login button");
      await continueButton.click();
    }
    console.log("(login driver) awaiting password input");
    const passwordInput = await page.waitForSelector("#input_1");
    console.log("(login driver) typing password");
    await passwordInput.type(password);
    console.log("(login driver) awaiting login button");

    console.log("(login driver) pressing enter");
    await passwordInput.press("Enter");

    console.log("(login driver) DONE!");

    await new Promise(resolve => setTimeout(resolve, 2000));

    const formHtml = page.$eval("form", element => {
      return element.outerHTML;
    });
    console.log("(login driver) form html:", formHtml);
  };

  return {
    close,
    waitForLogin: async () => {
      await waitForLoginForm();
      return { login };
    },
    waitForEditor: async () => {
      await waitForEditor();
      return {
        addTextElement,
        push,
        saveLocal
      };
    },
    pressKey: key => page.keyboard.press(key),
    page
  };
};
