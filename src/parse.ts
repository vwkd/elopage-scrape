const CONTENT_FILEPATH = "content.json";
const META_FILEPATH = "meta.json";

const OUTPUT_FILEPATH = "out/text.html";
const IMAGES_FOLDER = "out/images";
const VIDEOS_FOLDER = "out/videos";
const FILES_FOLDER = "out/files";

// todo: remove in favor of markdown
await Deno.writeTextFile(OUTPUT_FILEPATH, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

`);

// const [FILEPATH] = Deno.args;
// if (!FILEPATH) {
//   throw new Error(`Requires filepath argument`);
// }

const metaJson = await Deno.readTextFile(META_FILEPATH);
const metaArray = JSON.parse(metaJson);

const contentJson = await Deno.readTextFile(CONTENT_FILEPATH);
const contentArray = JSON.parse(contentJson);

// note: assumes `"success": true` everywhere
for (const metaObj of metaArray) {
  const title = metaObj.data.name;
  const content_id = metaObj.data.content_page_id;

  await addTitle(title);

  // note: assumes unique `content_id` and `"success": true` everywhere
  const contentObj = contentArray.find(contentObj => contentObj.data.id == content_id);

  // todo: assumes meta and content arrays are bijective (every entry in one maps exactly to unique entry in other)

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
      // handlePicture(child);
    } else if (form == "video") {
      // handleVideo(child);
    } else if (form == "file") {
      // handleFile(child);
    } else {
      throw new Error(`unexpected content block form '${form}'`);
    }

  }
}

// todo: remove in favor of markdown
await Deno.writeTextFile(OUTPUT_FILEPATH, `</body>
</html>
`, { append: true });

async function addTitle(title: string) {
  const header = `<h2>${title}</h2>`

  const output = header + `\n\n`;

  // todo:
  // - convert to md

  await Deno.writeTextFile(OUTPUT_FILEPATH, output, { append: true });
}

async function handleText(child) {
  const text = child.content.text;

  // todo: remove after verified
  if (!text) {
    console.warn(`missing text in '${child.id}'`);
    return;
  }

  const textUnstyled = text.replace(/(style|class|id)="[^"]*" ?/g, "").replace(/(style|class|id)='[^']*' ?/g, "").replace(/contenteditable="true" ?/g, "");
  const output = textUnstyled + `\n\n`;

  // todo: 
  // - strip style
  // - (?) strip classes
  // - convert to md

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
