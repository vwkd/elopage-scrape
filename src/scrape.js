import dotenv from "dotenv";
dotenv.config();

import { writeFile } from "node:fs/promises";
import { login } from "./login.js";
import { sortLessons } from "./sort.js";
import { getContent, getCourse, getLessons } from "./api.js";

const START_URL = process.env.START_URL;

const COURSE_FILEPATH = "course.json";
const LESSONS_FILEPATH = "lessons.json";
const CONTENT_FILEPATH = "content.json";

console.info(`Start scraping course '${START_URL}' ...`);

const { token, course_session_id } = login();

console.info(`Scraping course details ...`);
const course = await getCourse(course_session_id, token);
await writeFile(COURSE_FILEPATH, JSON.stringify(course));

console.info(`Scraping lesson index ...`);
const lessons = await getLessons(course_session_id, token);
sortLessons(lessons);
await writeFile(LESSONS_FILEPATH, JSON.stringify(lessons));

console.info(`Scraping lesson content ...`);
const content = [];
const lessonsArray = lessons.data.list;
for (const lessonsObj of lessonsArray) {
  const title = lessonsObj.name;
  const lesson_id = lessonsObj.id;
  const content_page_id = lessonsObj.content_page_id;
  const active = lessonsObj.active;

  if (!content_page_id) {
    console.debug(`Skipping section header '${title}'`);
    continue;
  }

  if (active === false) {
    console.info(`Scraping [INACTIVE] '${title}' ...`);
  } else {
    console.info(`Scraping '${title}' ...`);
  }

  const content_page = await getContent(lesson_id, content_page_id, course_session_id, token);

  content.push(content_page);
}

await writeFile(CONTENT_FILEPATH, JSON.stringify(content));
