import dotenv from "dotenv";
dotenv.config()

import { writeFile } from "node:fs/promises";
import { login } from "./login.js"
import { delay, random_number } from "./utils.js";
import { sortLessons } from "./sort.js";
import { makeRequest } from "./api.js";

const USER_AGENT = process.env.USER_AGENT;
const START_URL = process.env.START_URL;

const DELAY = process.env.DELAY;
const DELAY_OFFSET = process.env.DELAY_OFFSET;

const LESSONS_FILEPATH = "lessons.json";
const CONTENT_FILEPATH = "content.json";

const LESSONS_URL = (course_session_id) => `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}/lessons?page=1&query=&per=10000&sort_key=id&sort_dir=desc&course_session_id=${course_session_id}`;

const CONTENT_URL = (course_session_id, lesson_id, content_page_id) => `https://api.elopage.com/v1/payer/course_sessions/${course_session_id}/lessons/${lesson_id}/content_pages/${content_page_id}?screen_size=desktop`;

console.info(`Start scraping course '${START_URL}' ...`);

const { token, course_session_id } = login();

// get lessons
console.info(`Fetching lessons from API ...`);
const lessonsUrl = LESSONS_URL(course_session_id);
// delay +- random offset, random_number
await delay(random_number(DELAY, DELAY_OFFSET));
const lessonsResponse = await makeRequest(lessonsUrl, token, USER_AGENT);
const lessons = await lessonsResponse.json();
// await writeFile(LESSONS_FILEPATH, JSON.stringify(lessons));
console.info(`Got ${lessons.data.total_count} lessons`);

// sort lessons
sortLessons(lessons);
await writeFile(LESSONS_FILEPATH, JSON.stringify(lessons));

// get content page for each lesson
console.info(`Fetching content pages from API ...`)
const content = [];
const lessonsArray = lessons.data.list;
for (const lessonsObj of lessonsArray) {
  const title = lessonsObj.name;
  const lesson_id = lessonsObj.id;
  const content_page_id = lessonsObj.content_page_id;
  const active = lessonsObj.active;
  
  // skip section header
  if (!content_page_id) {
    console.info(`Skipping section header '${title}'`);
    continue;
  }

  if (active === false) {
    console.info(`Fetching inactive lesson '${lesson_id}' - '${content_page_id}' - '${title}' ...`);
  } else {
    console.info(`Fetching lesson '${lesson_id}' - '${content_page_id}' - '${title}' ...`);
  }

  const contentUrl = CONTENT_URL(course_session_id, lesson_id, content_page_id);
  // delay +- random offset, random_number
  await delay(random_number(DELAY, DELAY_OFFSET));
  const contentResponse = await makeRequest(contentUrl, token, USER_AGENT);
  const contentJson = await contentResponse.json();
  content.push(contentJson);
}

await writeFile(CONTENT_FILEPATH, JSON.stringify(content));
