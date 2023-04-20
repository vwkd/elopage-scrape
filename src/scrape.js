import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config()

const USER_AGENT = process.env.USER_AGENT;
const START_URL = process.env.START_URL;

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const browser = await puppeteer.launch({
  headless: false,
  // defaultViewport: null,
  args: [`--window-size=1200,800`],
  defaultViewport: {
    width:1200,
    height:800
  }
});

const page = await browser.newPage();

await page.setUserAgent(USER_AGENT);

await page.goto(START_URL);

await page.type("#sign-in-email-text-field", USERNAME);
await page.type("#sign-in-password-text-field", PASSWORD);
await page.click("div.auth-form > div.elo-btn-container:nth-child(4) > button");

await page.waitForSelector("div.content-page");

// dismiss consent bot banner
await page.click("#CybotCookiebotDialogBodyButtonDecline");

const selectorNextButton = "div.cs-course-lesson-btn-next > button";

while (true) {
  await delay(5000);

  const titleElement = await page.waitForSelector("head > title");
  const title = await titleElement.evaluate(el => el.textContent);
  console.log(`title:`, title);

  const headerElement = await page.waitForSelector(".cs-course-banner-info div:nth-of-type(2)");
  const header = await headerElement.evaluate(el => el.textContent);
  console.log(`header:`, header);

  const headerTocElement = await page.waitForSelector("div.cs-course-lesson-area-container div.course-side-nav div.active");
  const headerToc = await headerTocElement.evaluate(el => el.textContent);
  console.log(`headerToc:`, headerToc);

  const headerTocLevel = headerTocElement.evaluate(el => {
    const parents = [];
 
    while (el.parentNode) {
      parents.push(el.parentNode);
      el = el.parentNode;
    }

    const categoryWraps = map(el => el.classList).filter(classList => classList.contains("category-wrap"));

    return categoryWraps.length;
  });
  console.log(`headerTocLevel:`, headerTocLevel);

  // break if next button is invisible on last page
  try {
    await page.waitForSelector(selectorNextButton, { visible: true });
  } catch {
    break;
  }

  // next page
  await page.click(selectNextButton);
}

function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  });
}
