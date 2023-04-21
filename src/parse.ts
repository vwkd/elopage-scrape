import "$std/dotenv/load.ts";

import TurndownService from "npm:turndown";
import { format } from "npm:prettier";
import { join } from "$std/path/mod.ts";

import { delay, random_number } from "./utils.ts";

const USER_AGENT = Deno.env.get("USER_AGENT");
const DELAY = Deno.env.get("DELAY");
const DELAY_OFFSET = Deno.env.get("DELAY_OFFSET");

const COURSE_FILEPATH = "course.json";
const LESSONS_FILEPATH = "lessons.json";
const CONTENT_FILEPATH = "content.json";

const OUTPUT_FILEPATH = "out/text.md";
const IMAGES_FOLDER = "out/images";
const VIDEOS_FOLDER = "out/videos";
const FILES_FOLDER = "out/files";

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

let output = "";
const promises = [];

const courseJson = await Deno.readTextFile(COURSE_FILEPATH);
const lessonsJson = await Deno.readTextFile(LESSONS_FILEPATH);
const contentJson = await Deno.readTextFile(CONTENT_FILEPATH);
const course = JSON.parse(courseJson);
const lessons = JSON.parse(lessonsJson);
const contentArray = JSON.parse(contentJson);

// note: assumes valid data, e.g. `"success": true`
const title = course.data.product.name;

console.info(`Start parsing course '${title}' ...`);

output += `# ${title}\n\n`;

// note: assumes valid data, e.g. `"success": true`
const lessonsArray = lessons.data.list;
for (const lessonsObj of lessonsArray) {
  const header = lessonsObj.name;
  const content_id = lessonsObj.content_page_id;
  const nesting_level = lessonsObj.nesting_level;

  console.info(`Adding lesson '${header}' ...`);

  output += `##${"#".repeat(nesting_level)} ${header}\n\n`;

  // skip section header
  if (!content_id) {
    continue;
  }

  // get content of lesson
  // note: assumes lessons array and content array are bijective, i.e. every entry in one maps exactly to unique entry in other, e.g. unique `content_id`
  // note: assumes valid data, e.g. `"success": true`
  const contentObj = contentArray.find((contentObj) => contentObj.data.id == content_id);

  const contentBlocks = contentObj.data.content_blocks;
  for (const contentBlock of contentBlocks) {
    const children = contentBlock.children;

    // note: always only 1 child
    const child = children[0];
    // todo: remove after verified
    if (children.length != 1) {
      console.error(`children more than 1: '${contentBlock.id}'`);
    }

    const form = child.form;

    if (form == "text") {
      const text = child.content.text;

      if (!text) {
        console.warn(`missing text in '${child.id}'`);
        continue;
      }

      // fix unrespected line breaks [#433](https://github.com/mixmark-io/turndown/issues/433)
      const html_fixed = text.replace(/<strong>(<br>)+<\/strong>/g, "$1");

      const md_ugly = turndownService.turndown(html_fixed);
      const md = format(md_ugly, { parser: "markdown" });

      output += md + `\n`;
    } else if (form == "picture") {
      // todo: verify that there always is name and url

      // todo: remove after verified and noted
      if (child.goods.length != 1) {
        console.error(`goods more than 1: '${child.id}'`);
      }

      // todo: which filename?
      const filename = child.goods[0].digital.name;
      const filename2 = child.goods[0].digital.file.name;
      // todo: remove after verified and noted
      if (filename !== filename2) {
        console.error(`different filenames: '${filename}' vs. '${filename2}'`);
      }

      // todo: which URL?
      const url = child.cover.url;
      const url2 = child.goods[0].digital.file.icon;
      // todo: remove after verified and noted
      if (!url2.startsWith(url)) {
        console.error(`different urls: '${url}' vs. '${url2}'`);
      }

      promises.push(download(url, filename, IMAGES_FOLDER));
    } else if (form == "video") {
      // todo: verify that there always is name and url

      // todo: remove after verified and noted
      if (child.goods.length != 1) {
        console.error(`goods more than 1: '${child.id}'`);
      }

      const filename = child.goods[0].digital.wistia_data.name;
      //child.goods[0].digital.file.name;

      const asset = child.goods[0].digital.wistia_data.assets.find(a => a.type == "OriginalFile");
      const url = asset.url;

      // todo: get thumbnail if available
      //child.goods[0].digital.file....

      promises.push(download(url, filename, VIDEOS_FOLDER));
    } else if (form == "file") {
      // todo: verify that there always is name and url

      // todo: remove after verified and noted
      if (child.goods.length != 1) {
        console.error(`goods more than 1: '${child.id}'`);
      }

      const filename = child.goods[0].digital.file.name;

      // todo: which URL?
      const url = child.goods[0].digital.file.original;
      const url2 = child.goods[0].digital.file.icon;
      // todo: remove after verified and noted
      if (!url2.startsWith(url)) {
        console.error(`different urls: '${url}' vs. '${url2}'`);
      }

      promises.push(download(url, filename, FILES_FOLDER));
    } else {
      throw new Error(`unexpected content block form '${form}'`);
    }
  }
}

await Deno.writeTextFile(OUTPUT_FILEPATH, output);
await Promise.all(promises);

/**
 * Download file and streamingly write
 * note: delayed by delay +- random offset
 */
async function download(url: string, filename: string, foldername: string) {

  await delay(random_number(DELAY, DELAY_OFFSET));

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
    console.error(`Skipping response that's not ok: '${res.status}' - '${res.statusText}'`);
    return;
  }

  const filepath = join(foldername, filename);
  const file = await Deno.create(filepath);
  await res.body.pipeTo(file.writable);
  file.close();
}