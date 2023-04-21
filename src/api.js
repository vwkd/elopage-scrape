import dotenv from "dotenv";
dotenv.config();

import { delay, random_number } from "./utils.js";

const USER_AGENT = process.env.USER_AGENT;
const DELAY = process.env.DELAY;
const DELAY_OFFSET = process.env.DELAY_OFFSET;

/**
 * Get lessons from API
 */
export async function getLessons(course_session_id, token) {
  // console.debug(`Fetching lessons from API ...`);

  const lessonsUrl = `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}/lessons?page=1&query=&per=10000&sort_key=id&sort_dir=desc&course_session_id=${course_session_id}`;

  // delay +- random offset, random_number
  await delay(random_number(DELAY, DELAY_OFFSET));

  const lessonsResponse = await makeRequest(lessonsUrl, token);
  const lessons = await lessonsResponse.json();
  console.info(`Got ${lessons.data.total_count} lessons`);

  return lessons;
}

/**
 * Get content of lesson from API
 */
export async function getContent(lesson_id, content_page_id, course_session_id, token) {
  // console.debug(`Fetching content '${content_page_id}' of lesson '${lesson_id}' from API ...`);

  const contentUrl = `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}/lessons/${lesson_id}/content_pages/${content_page_id}?screen_size=desktop`;

  // delay +- random offset, random_number
  await delay(random_number(DELAY, DELAY_OFFSET));

  const contentResponse = await makeRequest(contentUrl, token);
  const content = await contentResponse.json();

  return content;
}

async function makeRequest(url, token) {
  return fetch(url, {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "de",
      "authorization": token,
      "content-language": "de",
      "origin": "https://elopage.com",
      "referer": "https://elopage.com/",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": USER_AGENT,
    },
    // "referrer": "https://elopage.com/",
    // "referrerPolicy": "strict-origin-when-cross-origin",
    // "body": null,
    // "method": "GET",
    // "mode": "cors",
    // "credentials": "include"
  });
}
