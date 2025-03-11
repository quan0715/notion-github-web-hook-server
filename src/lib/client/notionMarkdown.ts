import { collectPaginatedAPI, isFullBlock } from "@notionhq/client";
import { notionClient } from "./notionClient";
import { isLogBlock } from "./notionLog";
import { convertRichTextToPlainText } from "../helper/notion";
import {
  ImageBlockObjectResponse,
  FileBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
// 將 Notion 的 Block 轉換為 Markdown

export const notionToMarkdown = async (pageId: string) => {
  const blocks = await collectPaginatedAPI(notionClient.blocks.children.list, {
    block_id: pageId,
  });
  return blocks
    .map((block) => {
      console.log(block);
      if (isLogBlock(block)) {
        return "";
      }
      if (!isFullBlock(block)) {
        return "";
      }
      switch (block.type) {
        case "paragraph":
          return convertRichTextToPlainText(block.paragraph.rich_text);
        case "heading_1":
          return `# ${convertRichTextToPlainText(block.heading_1.rich_text)}`;
        case "heading_2":
          return `## ${convertRichTextToPlainText(block.heading_2.rich_text)}`;
        case "heading_3":
          return `### ${convertRichTextToPlainText(block.heading_3.rich_text)}`;
        case "image":
          return coverImageToMarkdown(block);
        case "file":
          return fileToMarkdown(block);
        case "numbered_list_item":
          return `1. ${convertRichTextToPlainText(
            block.numbered_list_item.rich_text
          )}`;
        case "bulleted_list_item":
          return `- ${convertRichTextToPlainText(
            block.bulleted_list_item.rich_text
          )}`;
        case "divider":
          return "---";
        case "to_do":
          return `- [${
            block.to_do.checked ? "x" : " "
          }] ${convertRichTextToPlainText(block.to_do.rich_text)}`;
        case "quote":
          return `> ${convertRichTextToPlainText(block.quote.rich_text)}`;
        case "code":
          return `\`\`\`${block.code.language}\n${convertRichTextToPlainText(
            block.code.rich_text
          )}\n\`\`\``;
        case "callout":
          return ``;
        default:
          return "";
      }
    })
    .filter((markdown) => markdown !== "")
    .join("\n");
};

function coverImageToMarkdown(block: ImageBlockObjectResponse) {
  let url = "";
  if (block.image.type === "external") {
    url = block.image.external.url;
  } else {
    url = block.image.file.url;
  }
  return `![${block.id}](${url})`;
}

function fileToMarkdown(block: FileBlockObjectResponse) {
  console.log(block);
  let url = "";
  let fileName = block.file.name;
  if (block.file.type === "external") {
    url = block.file.external.url;
  } else {
    url = block.file.file.url;
  }
  return `[${fileName}](${url})`;
}
