const puppeteer = require("puppeteer-extra");
const PuppeteerStealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(PuppeteerStealthPlugin());
const eventually = require("wix-eventually");
const localEditorDriverCreator = require("./localEditorDriver");

module.exports = async port => {
  const browser = await eventually(
    async () =>
      await puppeteer.connect({
        browserURL: `http://localhost:${port}`,
        defaultViewport: { width: 1280, height: 960 }
      }),
    { timeout: 20000 }
  );
  const localEditorDriver = eventually(
    async () => {
      const [page] = await browser.pages();
      expect(page).toBeDefined();
      return localEditorDriverCreator(page);
    },
    { timeout: 20000 }
  );
  return localEditorDriver;
};
