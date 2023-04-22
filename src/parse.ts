import "$std/dotenv/load.ts";
import { exists } from "$std/fs/exists.ts";

import TurndownService from "npm:turndown";
import { format } from "npm:prettier";
import { join } from "$std/path/mod.ts";

import { delay, random_number } from "./utils.ts";
import type { Course } from "./types/course.ts";
import type { Lessons } from "./types/lessons.ts";
import type { Content } from "./types/content.ts";

const USER_AGENT = Deno.env.get("USER_AGENT");
const DELAY = Deno.env.get("DELAY");
const DELAY_OFFSET = Deno.env.get("DELAY_OFFSET");

const COURSE_FILEPATH = "course.json";
const LESSONS_FILEPATH = "lessons.json";
const CONTENT_FILEPATH = "content.json";

const OUTPUT_FOLDER = "out";
const MD_FILENAME = "text.md";
const IMAGES_SUBFOLDER = "images";
const VIDEOS_SUBFOLDER = "videos";
const FILES_SUBFOLDER = "files";

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

let output = "";

const courseJson = await Deno.readTextFile(COURSE_FILEPATH);
const lessonsJson = await Deno.readTextFile(LESSONS_FILEPATH);
const contentJson = await Deno.readTextFile(CONTENT_FILEPATH);
const course: Course = JSON.parse(courseJson);
const lessons: Lessons = JSON.parse(lessonsJson);
const contentArray: Content[] = JSON.parse(contentJson);

// note: assumes valid data, e.g. `"success": true`
const title = course.data.product.name;

console.info(`Start parsing course '${title}' ...`);

output += `# ${title}\n`;

// note: assumes valid data, e.g. `"success": true`
const lessonsArray = lessons.data.list;
for (const lessonsObj of lessonsArray) {
  const content_id = lessonsObj.content_page_id;
  const nesting_level = lessonsObj.nesting_level;
  const active = lessonsObj.active;
  const header = lessonsObj.name + (active ? "" : " [INACTIVE]");

  // console.debug(`Adding lesson '${header}' ...`);

  output += `\n##${"#".repeat(nesting_level)} ${header}\n`;

  // skip section header
  if (!content_id) {
    continue;
  }

  // get content of lesson
  // note: assumes lessons array and content array are bijective, i.e. every entry in one maps exactly to unique entry in other, e.g. unique `content_id`
  // note: assumes valid data, e.g. `"success": true`
  const contentObj = contentArray.find((contentObj) => contentObj.data.id == content_id)!;

  const contentBlocks = contentObj.data.content_blocks;
  for (const contentBlock of contentBlocks) {
    const children = contentBlock.children;

    // note: always only 1 child
    const child = children[0];
    // todo: remove after verified
    if (children.length > 1) {
      console.warn(`WARNING: Choosing first of multiple children in '${contentBlock.id}'`);
    } else if (children.length == 0) {
      console.error(`ERROR: Skipping due to no children in '${contentBlock.id}'`);
      continue;
    }

    const form = child.form;

    if (form == "text") {
      const text = child.content.text;

      if (!text) {
        console.error(`ERROR: Skipping due to no text in '${child.id}'`);
        continue;
      }

      // fix unrespected line breaks [#433](https://github.com/mixmark-io/turndown/issues/433)
      const html_fixed = text.replace(/<strong>(<br>)+<\/strong>/g, "$1");

      const md_ugly = turndownService.turndown(html_fixed);
      const md = format(md_ugly, { parser: "markdown" });

      // note: prettier already adds one trailing newline
      output += `\n${md}`;
    } else if (form == "picture") {
      // todo: verify that there always is name and url

      // todo: remove after verified and noted
      if (child.goods.length > 1) {
        console.warn(`WARNING: Choosing first of multiple goods in '${child.id}'`);
      } else if (child.goods.length == 0) {
        console.error(`ERROR: Skipping due to no goods in '${child.id}'`);
        continue;
      }

      // todo: which filename?
      const filename = child.goods[0].digital.name;
      // const filename2 = child.goods[0].digital.file.name;

      const linkpath = join(IMAGES_SUBFOLDER, encodeURIComponent(filename));
      output += `\n![${filename}](./${linkpath})\n`;

      // todo: which URL?
      const url = child.cover.url;
      // const url2 = child.goods[0].digital.file.icon;

      const filepath = join(OUTPUT_FOLDER, IMAGES_SUBFOLDER, filename);
      await download(url, filepath);
    } else if (form == "video") {
      // todo: verify that there always is name and url

      // todo: remove after verified and noted
      if (child.goods.length > 1) {
        console.warn(`WARNING: Choosing first of multiple goods in '${child.id}'`);
      } else if (child.goods.length == 0) {
        console.error(`ERROR: Skipping due to no goods in '${child.id}'`);
        continue;
      }

      const filename = child.goods[0].digital.wistia_data.name;
      //child.goods[0].digital.file.name;

      const linkpath = join(VIDEOS_SUBFOLDER, encodeURIComponent(filename));
      output += `\n![${filename}](./${linkpath})\n`;

      const asset = child.goods[0].digital.wistia_data.assets.find(a => a.type == "OriginalFile");
      const url = asset.url;

      // todo: get thumbnail if available
      //child.goods[0].digital.file....

      const filepath = join(OUTPUT_FOLDER, VIDEOS_SUBFOLDER, filename);
      await download(url, filepath);
    } else if (form == "file") {
      // todo: verify that there always is name and url

      // todo: remove after verified and noted
      if (child.goods.length > 1) {
        console.warn(`WARNING: Choosing first of multiple goods in '${child.id}'`);
      } else if (child.goods.length == 0) {
        console.error(`ERROR: Skipping due to no goods in '${child.id}'`);
        continue;
      }

      const filename = child.goods[0].digital.file.name;

      const linkpath = join(FILES_SUBFOLDER, encodeURIComponent(filename));
      output += `\n[${filename}](./${linkpath})\n`;

      // todo: which URL?
      const url = child.goods[0].digital.file.original;
      // const url2 = child.goods[0].digital.file.icon;

      const filepath = join(OUTPUT_FOLDER, FILES_SUBFOLDER, filename);
      await download(url, filepath);
    } else {
      throw new Error(`ERROR: Unexpected content block form '${form}'`);
    }
  }
}

const filepath = join(OUTPUT_FOLDER, MD_FILENAME);
await Deno.writeTextFile(filepath, output);

/**
 * Download file and streamingly write
 * - note: delayed by delay +- random offset
 */
async function download(url: string, filepath: string) {
  if (await exists(filepath, {
    isReadable: true,
    isFile: true,
  })) {
    // console.debug(`Skip download already exists '${filepath}'`);
    return;
  } else {
    // console.debug(`Downloading '${filepath}' ...`);
  }

  await delay(random_number(DELAY, DELAY_OFFSET));

  try {
    const res = await fetch(url, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-GB,en;q=0.5",
        "referer": "https://elopage.com/",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
        "user-agent": USER_AGENT,
      },
    });

    if (!res.ok) {
      console.error(`ERROR: Skipping ${res.status} response in '${filepath}'`);
      return;
    }

    const file = await Deno.create(filepath);

    try {
      await res.body.pipeTo(file.writable);
    } catch (e) {
      console.error(`ERROR: Skipping interrupted download in '${filepath}': '${e}'`);
      await Deno.remove(filepath);
    } finally {
      file.close();
    }
  } catch (e) {
    console.error(`ERROR: Skipping failed response in '${filepath}': '${e}'`);
  }
}
