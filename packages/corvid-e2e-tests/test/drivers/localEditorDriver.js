const { byAid } = require("./utils");

const PUSH_BUTTON_SELECTOR = byAid("top-bar-button-local-push");
const ADD_ELEMENT_SELECTOR = ".add-panel";
const ADD_TEXT_SELECTOR = ".add-panel-category-list .text";
const THEMED_TEXTS_SELECTOR =
  '[data-section-title="Themed Text"] .live-text span';

module.exports = page => {
  const waitForEditor = async () =>
    await page.waitForSelector(PUSH_BUTTON_SELECTOR, { timeout: 30000 });

  const waitForLoginForm = async () =>
    await page.waitForSelector(".log-in-title");

  const close = async () => await page.close();

  const push = async () => await page.click(PUSH_BUTTON_SELECTOR);

  const addTextElement = async () => {
    await page.click(ADD_ELEMENT_SELECTOR);
    await page.waitForSelector(ADD_TEXT_SELECTOR);
    await page.hover(ADD_TEXT_SELECTOR);
    await page.waitForSelector(THEMED_TEXTS_SELECTOR);
    const textElements = await page.$(THEMED_TEXTS_SELECTOR);
    await textElements.click();
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
    login,
    close
  };
};
