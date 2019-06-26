const { byAid } = require("./utils");

const PUSH_BUTTON_SELECTOR = byAid("top-bar-button-local-push");
const ADD_ELEMENT_SELECTOR = ".add-panel";
const ADD_TEXT_SELECTOR = ".add-panel-category-list .text .control-label-base";
// const ON_STAGE_TEXT_ELEMENT_SELECTOR = "#gfpp";
const THEMED_TEXTS_SELECTOR =
  '[data-section-title="Themed Text"] .live-text span';

const delay = time => {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
};

module.exports = page => {
  const waitForEditor = async () =>
    await page.waitForSelector(PUSH_BUTTON_SELECTOR, { timeout: 30000 });

  const subscribeToLeaveDialog = callback => {
    page.on("dialog", async dialog => {
      // console.log("*****************");
      callback();
      await dialog.accept();
      // console.log("dialog accepted");
      await delay(1000);
      await page.keyboard.press(String.fromCharCode(13));
    });
  };

  const waitForLoginForm = async () =>
    await page.waitForSelector(".log-in-title");

  const close = async () => await page.close({ runBeforeUnload: true });

  const push = async () => await page.click(PUSH_BUTTON_SELECTOR);

  const addTextElement = async () => {
    await page.waitForSelector(ADD_ELEMENT_SELECTOR);
    await page.click(ADD_ELEMENT_SELECTOR);
    await page.waitForSelector(ADD_TEXT_SELECTOR);
    await page.hover(ADD_TEXT_SELECTOR);
    await page.waitForSelector(THEMED_TEXTS_SELECTOR);
    const textElement = await page.$(THEMED_TEXTS_SELECTOR);
    await textElement.click();
  };

  const login = async ({ username, password }) => {
    const emaiInput = await page.$("#input_0");
    await emaiInput.type(username);
    const passwordInput = await page.$("#input_1");
    await passwordInput.type(password);
    const loginButton = await page.$(".login-btn");
    await loginButton.click();
  };

  return {
    waitForEditor,
    waitForLoginForm,
    push,
    addTextElement,
    subscribeToLeaveDialog,
    login,
    close
  };
};
