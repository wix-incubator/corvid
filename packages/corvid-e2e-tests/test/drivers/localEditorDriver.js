const { byAid } = require("./utils");

const PUSH_BUTTON_SELECTOR = byAid("top-bar-button-local-push");

module.exports = page => {
  const waitForEditor = async () =>
    await page.waitForSelector(PUSH_BUTTON_SELECTOR);

  const push = async () => await page.click(PUSH_BUTTON_SELECTOR);

  return {
    waitForEditor,
    push
  };
};
