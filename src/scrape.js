import puppeteer from "puppeteer";

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0";

const browser = await puppeteer.launch({
  headless: false,
});

const page = await browser.newPage();

await page.setUserAgent(USER_AGENT)
