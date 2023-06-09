// Generated by https://quicktype.io

import type { ChildFile } from "./child_file.ts";
import type { ChildPicture } from "./child_picture.ts";
import type { ChildText } from "./child_text.ts";
import type { ChildVideo } from "./child_video.ts";
import type { ErrorResponse } from "./common.ts";

export type ContentResponse = ErrorResponse | Content;

export interface Content {
  success: true;
  data: ContentData;
}

export interface ContentData {
  id: number;
  name: null;
  area: null;
  category_id: null;
  live: boolean | null;
  prefs: Prefs;
  seller_id: number;
  template: boolean | null;
  created_at: Date;
  updated_at: Date;
  content_blocks: ContentBlock[];
}

export interface ContentBlock {
  id: number;
  name: null;
  // (?) always single child
  children: Child[];
  content: ContentBlockContent;
  content_page_id: number;
  cover_id: null;
  data: ContentBlockData;
  embeddable_item_id: null;
  // (?) always "text"
  form: "text";
  is_row: boolean;
  lesson_id: null;
  parent_id: null;
  position: number;
  products: [];
  purpose: number;
  seller_id: null;
  template: boolean | null;
  created_at: Date;
  updated_at: Date;
  goods: [];
}

export type Child = ChildText | ChildPicture | ChildVideo | ChildFile;

export interface ContentBlockContent {
  list: null;
}

export interface ContentBlockData {
  background_image: null;
}

export interface Prefs {
}
