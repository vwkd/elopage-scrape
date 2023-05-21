// import rehypeNormalizeSpaces from "https://raw.githubusercontent.com/vwkd/rehype-normalize-spaces/main/src/main.ts";
import rehypeNormalizeSpaces from "../rehype-normalize-spaces/src/main.ts";

// import rehypeUnwrapLinebreaks from "https://raw.githubusercontent.com/vwkd/rehype-unwrap-linebreaks/main/src/main.ts";
import rehypeUnwrapLinebreaks from "../rehype-unwrap-linebreaks/src/main.ts";

// import rehypeUnwrapSpaces from "https://raw.githubusercontent.com/vwkd/rehype-unwrap-spaces/main/src/main.ts";
import rehypeUnwrapSpaces from "../rehype-unwrap-spaces/src/main.ts";

// why does order matter at all?
// first rehypeUnwrapSpaces and then rehypeUnwrapLinebreaks adds more line breaks, but doesn't unwrap (some or all?) leading and trailing spaces
// 
export default [
  rehypeNormalizeSpaces,
  ...rehypeUnwrapSpaces,
  ...rehypeUnwrapLinebreaks,
];
