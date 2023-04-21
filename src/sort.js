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

/**
 * Sort lessons in-place and add nesting level
 * beware: mutates the input!
 */
export function sortLessons(lessons) {
  // assumes `"success": true` everywhere
  const array = lessons.data.list;

  const currentParents = [null];
  // note: shouldn't be higher than 5 since Markdown only supports 6 header levels
  let currentLevel = 0;

  const array_sorted = [];

  recurse();

  if (array.length) {
    throw new Error(`Unexpected '${array.length}' remaining items in array`);
  }

  lessons.data.list = array_sorted;

  function recurse() {
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
      header.nesting_level = currentLevel;

      // console.debug(`Add '${header?.name}' ...`);

      array_sorted.push(header);

      array.removeElement(header);

      currentLevel += 1;
      currentParents[currentLevel] = header.id;
    }
    
    recurse();
  }
}
