import "$std/dotenv/load.ts";

import { sortLessons } from "./sort.ts";
import { getContent, getCourse, getLessons } from "./api.ts";
import type { Content } from "./types/content.ts";

const COURSE_SESSION_ID = Deno.env.get("COURSE_SESSION_ID");
const TOKEN = Deno.env.get("ACCESS_TOKEN");

const COURSE_FILEPATH = "tmp/course.json";
const LESSONS_FILEPATH = "tmp/lessons.json";
const CONTENT_FILEPATH = "tmp/content.json";

if (!COURSE_SESSION_ID || !TOKEN) {
  throw new Error(`Necessary environmental variables not set.`);
}

console.info(`Start scraping course '${COURSE_SESSION_ID}' ...`);

console.info(`Scraping course details ...`);
const course = await getCourse(COURSE_SESSION_ID, TOKEN);
await Deno.writeTextFile(COURSE_FILEPATH, JSON.stringify(course));

console.info(`Scraping lesson index ...`);
const lessonsUnsorted = await getLessons(COURSE_SESSION_ID, TOKEN);
const lessons = sortLessons(lessonsUnsorted);
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

  const content_page = await getContent(lesson_id, content_page_id, COURSE_SESSION_ID, TOKEN);

  content.push(content_page);
}

await Deno.writeTextFile(CONTENT_FILEPATH, JSON.stringify(content));
