import type { Lessons, List } from "./types/lessons.ts";

/**
 * Gets minimum object element of array with respect to property
 * note: assumes elements are objects, doesn't verify
 * note: assumes property exists, doesn't verify
 * note: assumes property is unique, i.e. no two identical values
 *
 * For example
 *
 * ```js
 * const a = [{x: 3}, {x: 1}, {x: 2}];
 * const b = a.getMinimum("x");
 * ```
 */
Array.prototype.getMinimum = function (propName: string) {
  if (this.length) {
    return this.reduce((prev, curr) => prev[propName] < curr[propName] ? prev : curr);
  } else {
    return undefined;
  }
};

/**
 * Removes element from array
 * returns new array with elements copied
 * note: assumes elements are unique, deletes only first element
 *
 * For example, with object references
 *
 * ```js
 * const a = [{x: 1}, {x: 2}, {x: 3}];
 * const b = a[2];
 * const c = a.removeElement(a);
 * ```
 */
Array.prototype.removeElement = function (el: unknown) {
  const index = this.indexOf(el);
  if (index != -1) {
    return this.toSpliced(index, 1);
  }
  return this;
};

/**
 * Sort lessons and add nesting level
 */
export function sortLessons(lessons: Lessons): Lessons {
  // note: assumes valid data, e.g. `"success": true`
  const unsorted = lessons.data.list;

  const currentParents = [null];
  // note: shouldn't be higher than 5 since Markdown only supports 6 header levels
  let currentLevel = 0;

  const { sorted } = recurse({ unsorted, sorted: []});

  // clone lessons
  const lessonsNew: Lessons = structuredClone(lessons);
  lessonsNew.data.list = sorted;

  return lessonsNew;

  /**
   * Creates sorted array in a recursive loop
   * finds next element in unsorted array and adds it to sorted array
   * removes it from copy of unsorted array
   * recurses until unsorted array is empty and sorted array is full
   * note: doesn't mutate original unsorted array, only empty sorted array
   */
  function recurse({ unsorted, sorted }: { unsorted: List[], sorted: List[] }): { unsorted: List[], sorted: List[] } {
    // console.debug(`currentLevel '${currentLevel}'`);

    // end recursion
    if (!unsorted.length) {
      return { unsorted, sorted };
    }

    // note: currentLevel must be >= 0
    const parent_id = currentParents[currentLevel];

    // console.debug(`parent_id '${parent_id}'`);

    let header = unsorted.filter((e) => e.parent_id === parent_id).getMinimum("position");

    // is at leaf, no further nested header, go up once
    if (!header && currentLevel > 0) {
      currentLevel -= 1;
    // continue going down
    } else {
      header.nesting_level = currentLevel;

      // console.debug(`Add '${header?.name}' ...`);

      sorted.push(header);

      unsorted = unsorted.removeElement(header);

      currentLevel += 1;
      currentParents[currentLevel] = header.id;
    }

    return recurse({ unsorted, sorted });
  }
}
