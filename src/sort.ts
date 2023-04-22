import type { Lessons, List } from "./types/lessons.ts";

/**
 * Gets minimum object element of array with respect to property
 * - note: assumes elements are objects, doesn't verify
 * - note: assumes property exists, doesn't verify
 * - note: assumes property is unique, i.e. no two identical values
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
 * - returns new array with elements copied
 * - note: assumes elements are unique, deletes only first element
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
  const unsorted = lessons.data.list;

  const { sorted } = sortArray({ unsorted, sorted: [], currentParents: [null], currentLevel: 0 });

  // clone lessons
  const lessonsNew: Lessons = structuredClone(lessons);
  lessonsNew.data.list = sorted;

  return lessonsNew;
}

// note: shouldn't be higher than 5 since Markdown only supports 6 header levels
interface sortArrayArguments {
  unsorted: List[];
  sorted: List[];
  currentParents: (string | null)[];
  currentLevel: number;
}

/**
 * Creates sorted array
 *
 * - finds next header in unsorted array and adds it to sorted array
 * - removes it from copy of unsorted array
 * - loops until copy of unsorted array is empty and sorted array is full
 * - note: uses recursion and mutates inputs except original unsorted array
 * - note: in initial argument sorted array must be `[]`, current parent ids must be [`null`], current nesting level must be `0`
 */
function sortArray({ unsorted, sorted, currentParents, currentLevel }: sortArrayArguments): sortArrayArguments {
  // console.debug(`currentLevel '${currentLevel}'`);

  // end recursion
  if (!unsorted.length) {
    return { unsorted, sorted, currentParents, currentLevel };
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

  return sortArray({ unsorted, sorted, currentParents, currentLevel });
}
