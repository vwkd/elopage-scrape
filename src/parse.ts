import TurndownService from "npm:turndown";
import { format } from "npm:prettier";

const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

const LESSONS_FILEPATH = "lessons_sorted.json";
const CONTENT_FILEPATH = "content.json";

const OUTPUT_FILEPATH = "out/text.md";
const IMAGES_FOLDER = "out/images";
const VIDEOS_FOLDER = "out/videos";
const FILES_FOLDER = "out/files";

// todo: use real title
const TITLE = "PLACEHOLDER....."

console.info(`Creating course '${TITLE}' ...`)

await addHeader1(TITLE);

const lessonsJson = await Deno.readTextFile(LESSONS_FILEPATH);
const lessons = JSON.parse(lessonsJson);
// note: assumes `"success": true` everywhere
const lessonsArray = lessons.data.list;

const contentJson = await Deno.readTextFile(CONTENT_FILEPATH);
const contentArray = JSON.parse(contentJson);

// note: assumes `"success": true` everywhere
for (const lessonsObj of lessonsArray) {
  const title = lessonsObj.name;
  const content_id = lessonsObj.content_page_id;
  const nesting_level = lessonsObj.nesting_level;
  
  console.info(`Adding lesson '${title}' ...`)
  
  await addHeader2plus(title, nesting_level);
  
  // section header
  if (!content_id) {
    continue;
  }

  // note: assumes unique `content_id` and `"success": true` everywhere
  const contentObj = contentArray.find(contentObj => contentObj.data.id == content_id);

  // todo: assumes lessons and content arrays are bijective (every entry in one maps exactly to unique entry in other)

  const contentBlocks = contentObj.data.content_blocks;
  
  for (const contentBlock of contentBlocks) {
    const children = contentBlock.children;

    // note: there is always only 1
    const child = children[0];
    
    // todo: remove after verified
    if (children.length != 1) {
      console.error(`children more than 1: '${contentBlock.id}'`);
    }

    const form = child.form;
    
    if (form == "text") {
      await handleText(child);
    } else if (form == "picture") {
      // await handlePicture(child);
    } else if (form == "video") {
      // handleVideo(child);
    } else if (form == "file") {
      // handleFile(child);
    } else {
      throw new Error(`unexpected content block form '${form}'`);
    }

  }
}

async function addHeader1(title: string) {
  const header = `# ${title}\n\n`;

  await Deno.writeTextFile(OUTPUT_FILEPATH, header);
}


async function addHeader2plus(title: string, level: number) {
  const header = `##${"#".repeat(level)} ${title}\n\n`;

  await Deno.writeTextFile(OUTPUT_FILEPATH, header, { append: true });
}

async function handleText(child) {
  const text = child.content.text;

  if (!text) {
    console.warn(`missing text in '${child.id}'`);
    return;
  }

  const md_ugly = turndownService.turndown(text);
  const md = format(md_ugly, { parser: "markdown" });  

  const output = md + `\n`;

  await Deno.writeTextFile(OUTPUT_FILEPATH, output, { append: true });
}

function handlePicture(child) {
  // todo: verify that there always is name and url

  // todo: remove after verified and noted
  if (child.goods.length != 1) {
    console.error(`goods more than 1: '${child.id}'`);
  }

  const filename = child.goods[0].digital.name;

  // todo: remove after verified and noted
  const filename2 = child.goods[0].digital.file.name
  if (filename !== filename2) {
    console.error(`different filenames: '${filename}' vs '${filename2}'`);
  }

  // todo:
  // const url = child.goods[0].digital.file...

  // todo: download
}

function handleVideo(child) {
  // todo: verify that there always is name and url

  // todo: remove after verified and noted
  if (child.goods[0].digital.wistia_data.assets.length != 1) {
    console.error(`assets more than 1: '${child.goods[0].digital.wistia_data.id}'`);
  }


  const filename = child.goods[0].digital.wistia_data.name;
  //child.goods[0].digital.file.name;
  const url = child.goods[0].digital.wistia_data.assets[0].url;
  const url_thumbnail = child.goods[0].digital.wistia_data.thumbnail.url;
  // digital.file seems to be useless

  // todo: download
}

function handleFile(child) {
  // todo: verify that there always is name and url
  const filename = child.goods[0].digital.file.name;
  const url = child.goods[0].digital.file.original;

  // todo: download
}
