import "$std/dotenv/load.ts";
import { join } from "$std/path/mod.ts";
import { parse } from "$std/flags/mod.ts";

import { sortLessons } from "./sort.ts";
import { getContent, getCourse, getLessons } from "./api.ts";
import type { Content } from "./types/content.ts";

const COURSE_SESSION_ID = Deno.env.get("COURSE_SESSION_ID");
const TOKEN = Deno.env.get("ACCESS_TOKEN");

const RAW_SUBFOLDER = "raw";
const COURSE_FILENAME = "course.json";
const LESSONS_FILENAME = "lessons.json";
const CONTENT_FILENAME = "content.json";

if (!COURSE_SESSION_ID || !TOKEN) {
  throw new Error(`Necessary environmental variables not set.`);
}

const args = parse(Deno.args, { boolean: true });
const OUTPUT_FOLDER = args._[0];
const INACTIVE = args.i ?? args.inactive;
const VERBOSE = args.v ?? args.verbose;

if (!OUTPUT_FOLDER) {
  throw new Error(`No output folder provided`);
}

console.info(`Start scraping course '${COURSE_SESSION_ID}' into '${OUTPUT_FOLDER} ...`);

// noop if directory already exists, doesn't throw due to `recursive: true`
await Deno.mkdir(join(OUTPUT_FOLDER, RAW_SUBFOLDER), { recursive: true });

console.info(`Scraping course details ...`);
const course = await getCourse(COURSE_SESSION_ID, TOKEN);
const course_filepath = join(OUTPUT_FOLDER, RAW_SUBFOLDER, COURSE_FILENAME);
await Deno.writeTextFile(course_filepath, JSON.stringify(course));

console.info(`Scraping lesson index ...`);
const lessonsUnsorted = await getLessons(COURSE_SESSION_ID, TOKEN);
const lessons = sortLessons(lessonsUnsorted);
const lessons_filepath = join(OUTPUT_FOLDER, RAW_SUBFOLDER, LESSONS_FILENAME);
await Deno.writeTextFile(lessons_filepath, JSON.stringify(lessons));

// note: needs to always load fresh content since can't reuse existing
// can't derive from lessons if content got updated in meantime, because `updated_at` property of content object doesn't match `updated_at` property of lesson object
console.info(`Scraping lesson content ...`);
const content: Content[] = [];
const lessonsArray = lessons.data.list;
for (const lessonsObj of lessonsArray) {
  const lesson_id = lessonsObj.id;
  const content_page_id = lessonsObj.content_page_id;

  const title = lessonsObj.name;
  const active = lessonsObj.active;

  if (!content_page_id) {
    VERBOSE && console.debug(`Skipping section header '${title}'`);
    continue;
  }

  if (!active && !INACTIVE) {
    VERBOSE && console.debug(`Skipping inactive '${title}' ...`);
    continue;
  }

  VERBOSE && console.debug(`Scraping '${title}${!active ? ` [INACTIVE]` : ""}' ...`);

  const content_page = await getContent(lesson_id, content_page_id, COURSE_SESSION_ID, TOKEN);

  content.push(content_page);
}

const content_filepath = join(OUTPUT_FOLDER, RAW_SUBFOLDER, CONTENT_FILENAME);
await Deno.writeTextFile(content_filepath, JSON.stringify(content));
