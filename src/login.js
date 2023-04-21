import dotenv from "dotenv";
dotenv.config()

import puppeteer from "puppeteer";

const VIEWPORT_WIDTH = process.env.VIEWPORT_WIDTH;
const VIEWPORT_HEIGHT = process.env.VIEWPORT_HEIGHT;

const USER_AGENT = process.env.USER_AGENT;
const START_URL = process.env.START_URL;

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

export async function login() {
  // start browser and configure
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

  // open page
  await page.goto(START_URL);

  // login
  await page.type("#sign-in-email-text-field", USERNAME);
  await page.type("#sign-in-password-text-field", PASSWORD);
  await page.click("div.auth-form > div.elo-btn-container:nth-child(4) > button");
  await page.waitForSelector("div.content-page");

  // get access token from cookies
  const cookies = await page.cookies();
  const token = cookies.find(e => e.name == "p_access_token")?.value;
  console.info(`Got access_token '${token}'`);

  // get course_session_id from URL
  const url = new URL(page.url());
  const course_session_id = url.searchParams.get("course_session_id");
  console.info(`Got course_session_id '${course_session_id}'`);

  await browser.close();

  return {
    token,
    course_session_id,
  }
}