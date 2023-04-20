import puppeteer from "puppeteer";
import { writeFile } from "node:fs/promises";
import dotenv from "dotenv";
dotenv.config()
import { delay, random_number } from "./utils.js";

const USER_AGENT = process.env.USER_AGENT;
const START_URL = process.env.START_URL;

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const DELAY = process.env.DELAY;
const DELAY_OFFSET = process.env.DELAY_OFFSET;

const LESSONS_FILEPATH = "lessons.json";
const META_FILEPATH = "meta.json";
const CONTENT_FILEPATH = "content.json";

const VIEWPORT_WIDTH = process.env.VIEWPORT_WIDTH;
const VIEWPORT_HEIGHT = process.env.VIEWPORT_HEIGHT;

// matches `https://api.elopage.com/v1/payer/course_sessions/9999999/lessons?page=1&query=&per=10000&sort_key=id&sort_dir=desc&course_session_id=9999999`
const RE_LESSONS = /^https:\/\/api\.elopage\.com\/v1\/payer\/course_sessions\/\d+\/lessons(?:\?[^?]+)?$/;
const isLessonsResponse = res => res.request().method() == "GET" && res.url().match(RE_LESSONS)?.length;

// matches `https://api.elopage.com/v1/payer/course_sessions/9999999/lessons/9999999`
const RE_META = /^https:\/\/api\.elopage\.com\/v1\/payer\/course_sessions\/\d+\/lessons\/\d+$/;
const isMetaResponse = res => res.request().method() == "GET" && res.url().match(RE_META)?.length;

// matches `https://api.elopage.com/v1/payer/course_sessions/9999999/lessons/9999999/content_pages/9999999?screen_size=desktop`
const RE_CONTENT = /^https:\/\/api\.elopage\.com\/v1\/payer\/course_sessions\/\d+\/lessons\/\d+\/content_pages\/\d+(?:\?[^?]+)?$/;
const isContentResponse = res => res.request().method() == "GET" && res.url().match(RE_CONTENT)?.length;

const meta = [];
const content = [];

console.info(`Start scraping course '${START_URL}' ...`);

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

console.info(`Logging in...`)

// start listening before `goto` navigation call to not miss responses
// check for GET request to skip OPTIONS preflight requests
const lessonsResponsePromise = page.waitForResponse(isLessonsResponse);
const metaResponsePromise1 = page.waitForResponse(isMetaResponse);
const contentResponsePromise1 = page.waitForResponse(isContentResponse);

await page.goto(START_URL);

await page.type("#sign-in-email-text-field", USERNAME);
await page.type("#sign-in-password-text-field", PASSWORD);
await page.click("div.auth-form > div.elo-btn-container:nth-child(4) > button");

await page.waitForSelector("div.content-page");

// dismiss consent bot banner
await page.click("#CybotCookiebotDialogBodyButtonDecline");

console.info(`Scraping page ${meta.length + 1}...`);

const lessonsResponse = await lessonsResponsePromise;
// console.debug(`Got lessons response`);
const lessons = await lessonsResponse.json();

const metaResponse1 = await metaResponsePromise1;
// console.debug(`Got meta response`);
const metaJson1 = await metaResponse1.json();
meta.push(metaJson1);

const contentResponse1 = await contentResponsePromise1;
// console.debug(`Got content response`);
const contentJson1 = await contentResponse1.json();
content.push(contentJson1);

const selectorNextButton = "div.cs-course-lesson-btn-next > button";

while (true) {
  // exit when next button is invisible on last page
  try {
    await page.waitForSelector(selectorNextButton, { visible: true, timeout: 1000 });
  } catch {
    console.info(`Finished scraping`);
    break;
  }
  
  console.info(`Scraping page ${meta.length + 1}...`)

  // delay +- random offset, random_number
  await delay(random_number(DELAY, DELAY_OFFSET));

  const metaResponsePromise = page.waitForResponse(isMetaResponse);
  const contentResponsePromise = page.waitForResponse(isContentResponse);

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

await writeFile(LESSONS_FILEPATH, JSON.stringify(lessons));
await writeFile(META_FILEPATH, JSON.stringify(meta));
await writeFile(CONTENT_FILEPATH, JSON.stringify(content));
