import "$std/dotenv/load.ts";

import { sortLessons } from "./sort.ts";
import { getContent, getCourse, getLessons } from "./api.ts";
import type { Content } from "./types/content.ts";

const START_URL = Deno.env.get("START_URL");
const TOKEN = Deno.env.get("ACCESS_TOKEN");

const COURSE_FILEPATH = "course.json";
const LESSONS_FILEPATH = "lessons.json";
const CONTENT_FILEPATH = "content.json";

const url = new URL(START_URL);
const course_session_id = url.searchParams.get("course_session_id");
console.info(`Start scraping course '${course_session_id}' ...`);

console.info(`Scraping course details ...`);
const course = await getCourse(course_session_id, TOKEN);
await Deno.writeTextFile(COURSE_FILEPATH, JSON.stringify(course));

console.info(`Scraping lesson index ...`);
const lessons = await getLessons(course_session_id, TOKEN);
sortLessons(lessons);
await Deno.writeTextFile(LESSONS_FILEPATH, JSON.stringify(lessons));

console.info(`Scraping lesson content ...`);
const content: Content[] = [];
const lessonsArray = lessons.data.list;
for (const lessonsObj of lessonsArray) {
  const lesson_id = lessonsObj.id;
  const content_page_id = lessonsObj.content_page_id;

  const title = lessonsObj.name;
  const active = lessonsObj.active;

  if (!content_page_id) {
    // console.debug(`Skipping section header '${title}'`);
    continue;
  }

  if (active === false) {
    // console.debug(`Scraping [INACTIVE] '${title}' ...`);
  } else {
    // console.debug(`Scraping '${title}' ...`);
  }

  const content_page = await getContent(lesson_id, content_page_id, course_session_id, TOKEN);

  content.push(content_page);
}

await Deno.writeTextFile(CONTENT_FILEPATH, JSON.stringify(content));
