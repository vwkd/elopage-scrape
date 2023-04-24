import "$std/dotenv/load.ts";

import type { ContentResponse } from "./types/content.ts";
import type { CourseResponse } from "./types/course.ts";
import type { LessonsResponse } from "./types/lessons.ts";

import { delay, random_number } from "./utils.ts";

const USER_AGENT = Deno.env.get("USER_AGENT");
const DELAY = Deno.env.get("DELAY");
const DELAY_OFFSET = Deno.env.get("DELAY_OFFSET");

if (!USER_AGENT || !DELAY || !DELAY_OFFSET) {
  throw new Error(`Necessary environmental variables not set.`);
}

/**
 * Get course details from API
 * - note: delayed by delay +- random offset
 */
export async function getCourse(course_session_id: string, token: string) {
  // console.debug(`Fetching course from API ...`);

  const courseUrl = `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}`;

  await delay(random_number(DELAY, DELAY_OFFSET));

  const courseResponse = await makeRequest(courseUrl, token);
  const course: CourseResponse = await courseResponse.json();

  if (!course.success) {
    throw new Error(`Couldn't get course: ${course.error.message}`);
  }

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
  const lessons: LessonsResponse = await lessonsResponse.json();
  // console.debug(`Got ${lessons.data.total_count} lessons`);

  if (!lessons.success) {
    throw new Error(`Couldn't get lessons: ${lessons.error.message}`);
  }

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
  const content: ContentResponse = await contentResponse.json();

  if (!content.success) {
    throw new Error(`Couldn't get content: ${content.error.message}`);
  }

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
