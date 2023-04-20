import puppeteer from "puppeteer";
import { writeFile } from "node:fs/promises";
import dotenv from "dotenv";
dotenv.config()
import { delay } from "./utils.js";

const USER_AGENT = process.env.USER_AGENT;
const START_URL = process.env.START_URL;

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const DELAY = process.env.DELAY;
const DELAY_OFFSET = process.env.DELAY_OFFSET;

const VIEWPORT_WIDTH = process.env.VIEWPORT_WIDTH;
const VIEWPORT_HEIGHT = process.env.VIEWPORT_HEIGHT;

const META_FILEPATH = "meta.json";
const CONTENT_FILEPATH = "content.json";

// matches `https://api.elopage.com/v1/payer/course_sessions/9999999/lessons/9999999`
const RE_META = /^https:\/\/api\.elopage\.com\/v1\/payer\/course_sessions\/\d+\/lessons\/\d+$/;

// matches `https://api.elopage.com/v1/payer/course_sessions/9999999/lessons/9999999/content_pages/9999999?screen_size=desktop`
const RE_CONTENT = /^https:\/\/api\.elopage\.com\/v1\/payer\/course_sessions\/\d+\/lessons\/\d+\/content_pages\/\d+(?:\?[^?]+)?$/;

const meta = [];
const content = [];

console.info(`Starting scrape '${START_URL}' ...`);

const browser = await puppeteer.launch({
  headless: false,
  args: [`--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`],
  defaultViewport: {
    width: Number(VIEWPORT_WIDTH),
    height: Number(VIEWPORT_HEIGHT),
  }
});

const page = await browser.newPage();

await page.setUserAgent(USER_AGENT);

console.info(`Scraping page ${meta.length + 1}...`)

// start listening before `goto` navigation call to not miss responses
// check for GET request to skip OPTIONS preflight requests
const metaResponsePromise = page.waitForResponse(res => res.request().method() == "GET" && res.url().match(RE_META)?.length);
const contentResponsePromise = page.waitForResponse(res => res.request().method() == "GET" && res.url().match(RE_CONTENT)?.length);

await page.goto(START_URL);

await page.type("#sign-in-email-text-field", USERNAME);
await page.type("#sign-in-password-text-field", PASSWORD);
await page.click("div.auth-form > div.elo-btn-container:nth-child(4) > button");

await page.waitForSelector("div.content-page");

// dismiss consent bot banner
await page.click("#CybotCookiebotDialogBodyButtonDecline");

const metaResponse = await metaResponsePromise;
// console.debug(`Got meta response`);
const metaJson = await metaResponse.json();
meta.push(metaJson);

const contentResponse = await contentResponsePromise;
// console.debug(`Got content response`);
const contentJson = await contentResponse.json();
content.push(contentJson);

const selectorNextButton = "div.cs-course-lesson-btn-next > button";

while (true) {
  // delay +- random offset, computed formula `Math.random() * (max - min) + min`
  await delay(Math.random() * (2 * DELAY_OFFSET) + (DELAY - DELAY_OFFSET));

  const metaResponsePromise = page.waitForResponse(res => res.request().method() == "GET" && res.url().match(RE_META)?.length);
  const contentResponsePromise = page.waitForResponse(res => res.request().method() == "GET" && res.url().match(RE_CONTENT)?.length);

  console.info(`Scraping page ${meta.length + 1}...`)

  // exit when next button is invisible on last page
  try {
    await page.waitForSelector(selectorNextButton, { visible: true });
  } catch {
    break;
  }

  await page.click(selectorNextButton);

  const metaResponse = await metaResponsePromise;
  // console.debug(`Got meta response`);
  const metaJson = await metaResponse.json();
  meta.push(metaJson);

  const contentResponse = await contentResponsePromise;
  // console.debug(`Got content response`);
  const contentJson = await contentResponse.json();
  content.push(contentJson);
}

await browser.close();

await writeFile(META_FILEPATH, JSON.stringify(meta));
await writeFile(CONTENT_FILEPATH, JSON.stringify(content));
