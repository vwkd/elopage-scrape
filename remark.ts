// import remarkMergeAdjacent from "https://raw.githubusercontent.com/vwkd/remark-merge-adjacent/main/src/main.ts";
import remarkMergeAdjacent from "../remark-merge-adjacent/src/main.ts";

// import remarkRemoveEmptyLinks from "https://raw.githubusercontent.com/vwkd/remark-remove-empty-links/main/src/main.ts";
import remarkRemoveEmptyLinks from "../remark-remove-empty-links/src/main.ts";

// import remarkRemoveEmptyInline from "https://raw.githubusercontent.com/vwkd/remark-remove-empty-inline/main/src/main.ts";
import remarkRemoveEmptyInline from "../remark-remove-empty-inline/src/main.ts";

// todo: merge nested identical content nodes if have same properties, e.g. `<em><em>foo</em></em>`

// note: order important! ???? REALLY?? TEST
// - `remarkRemoveEmpty` at end of chain because previous might also leave some new empty ones
export default [
  remarkMergeAdjacent,
  ...remarkRemoveEmptyLinks,
  ...remarkRemoveEmptyInline,
];