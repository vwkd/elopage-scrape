import "$std/dotenv/load.ts";

import type { Content } from "./types/content.ts";
import type { Course } from "./types/course.ts";
import type { Lessons } from "./types/lessons.ts";

import { delay, random_number } from "./utils.ts";

const USER_AGENT = Deno.env.get("USER_AGENT");
const DELAY = Deno.env.get("DELAY");
const DELAY_OFFSET = Deno.env.get("DELAY_OFFSET");

/**
 * Get course details from API
 * - note: delayed by delay +- random offset
 */
export async function getCourse(course_session_id: string, token: string) {
  // console.debug(`Fetching course from API ...`);

  const courseUrl = `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}`;

  await delay(random_number(DELAY, DELAY_OFFSET));

  const courseResponse = await makeRequest(courseUrl, token);
  const course: Course = await courseResponse.json();

  return course;
}

/**
 * Get lessons from API
 * - note: delayed by delay +- random offset
 */
export async function getLessons(course_session_id: string, token: string) {
  // console.debug(`Fetching lessons from API ...`);

  const lessonsUrl = `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}/lessons?page=1&query=&per=10000&sort_key=id&sort_dir=desc&course_session_id=${course_session_id}`;

  await delay(random_number(DELAY, DELAY_OFFSET));

  const lessonsResponse = await makeRequest(lessonsUrl, token);
  const lessons: Lessons = await lessonsResponse.json();
  // console.debug(`Got ${lessons.data.total_count} lessons`);

  return lessons;
}

/**
 * Get content of lesson from API
 * - note: delayed by delay +- random offset
 */
export async function getContent(lesson_id: string, content_page_id: string, course_session_id: string, token: string) {
  // console.debug(`Fetching content '${content_page_id}' of lesson '${lesson_id}' from API ...`);

  const contentUrl = `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}/lessons/${lesson_id}/content_pages/${content_page_id}?screen_size=desktop`;

  await delay(random_number(DELAY, DELAY_OFFSET));

  const contentResponse = await makeRequest(contentUrl, token);
  const content: Content = await contentResponse.json();

  return content;
}

async function makeRequest(url: string, token: string) {
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
