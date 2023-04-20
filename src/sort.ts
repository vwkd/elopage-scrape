// assumes property exists
// note: assumes property is unique, i.e. no duplicate positions
Array.prototype.getMinimum = function(propName) {
  if (this.length) {
    return this.reduce((prev, curr) => prev[propName] < curr[propName] ? prev : curr);
  } else {
    return undefined;
  }
}

// assumes object reference is unique, not added twice
Array.prototype.removeElement = function(el) {
  const index = this.indexOf(el);
  if (index !== -1) {
    this.splice(index, 1);
  }
  return this;
};

const json = await Deno.readTextFile("./lessons.json");

const lessons = JSON.parse(json);

// assumes `"success": true` everywhere
const array = lessons.data.list;

// beware: assume at most 6 nesting levels
// omit 6th level since no further children
// call level 0-4 to match indices
const currentParents = [null];
let currentLevel = 0;

const array_sorted = [];

order()

if (array.length) {
  throw new Error(`Unexpected '${array.length}' remaining items in array`)
}

lessons.data.list = array_sorted;

await Deno.writeTextFile("lessons_sorted.json", JSON.stringify(lessons));

/**
 * Sort lessons and add nesting level
 * uses recursion and edits array in-place
*/
function order() {
  // console.debug(`currentLevel '${currentLevel}'`);

  // end recursion
  if (!array.length) {
    return;
  }
  
  // note: currentLevel must be >= 0
  const parent_id = currentParents[currentLevel];
  
  // console.debug(`parent_id '${parent_id}'`);

  let header = array.filter(e => e.parent_id === parent_id).getMinimum("position");
    
  // is at leaf, no further nested header, go up once
  if (!header && currentLevel > 0) {
    currentLevel -= 1;
  // continue going down
  } else {
    console.info(`Add '${header?.name}' ...`);

    header.nesting_level = currentLevel;
    array_sorted.push(header);
    array.removeElement(header);

    currentLevel += 1;
    currentParents[currentLevel] = header.id;
  }
  order();
}
