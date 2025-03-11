import { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
export function convertRichTextToPlainText(
  richTextList: RichTextItemResponse[]
) {
  return richTextList
    .map((richText) => {
      if (richText.type === "text") {
        return richText.text.content;
      }
      return "";
    })
    .join("");
}

export type ApiColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "gray_background"
  | "brown_background"
  | "orange_background"
  | "yellow_background"
  | "green_background"
  | "blue_background"
  | "purple_background"
  | "pink_background"
  | "red_background";
