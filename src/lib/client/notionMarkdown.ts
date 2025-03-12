import { collectPaginatedAPI, isFullBlock } from "@notionhq/client";
import { notionClient } from "./notionClient";
import { isLogBlock } from "./notionLog";
import { convertRichTextToPlainText } from "../helper/notion";
import { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  ImageBlockObjectResponse,
  FileBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
// 將 Notion 的 Block 轉換為 Markdown

// 獲取基礎 URL，如果環境變數不存在則使用相對路徑
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.TEST_BASE_URL
    : process.env.BASE_URL || "";

function richTextToMarkdown(richText: RichTextItemResponse[]) {
  // with annotation
  // bold = true => **
  // italic = true => *
  // strikethrough = true => ~
  // underline = true => _
  // code = true => `
  // color = true => color (not supported)
  const result = richText.map((item) => {
    let plain_text = item.plain_text;
    if (item.type === "equation") {
      return `$$${item.equation.expression}$$`;
    }
    if (item.annotations.bold) {
      plain_text = `**${plain_text}**`;
    }
    if (item.annotations.italic) {
      plain_text = `*${plain_text}*`;
    }
    if (item.annotations.strikethrough) {
      plain_text = `~${plain_text}~`;
    }
    if (item.annotations.underline) {
      plain_text = `<ins>${plain_text}</ins>`;
    }
    if (item.annotations.code) {
      plain_text = `\`${plain_text}\``;
    }
    if (item.href) {
      plain_text = `[${plain_text}](${item.href})`;
    }
    return plain_text;
  });
  console.log(result);
  return result.join("");
}

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
          return richTextToMarkdown(block.paragraph.rich_text);
        case "heading_1":
          return `# ${richTextToMarkdown(block.heading_1.rich_text)}`;
        case "heading_2":
          return `## ${richTextToMarkdown(block.heading_2.rich_text)}`;
        case "heading_3":
          return `### ${richTextToMarkdown(block.heading_3.rich_text)}`;
        case "image":
          return coverImageToMarkdown(block);
        case "file":
          return fileToMarkdown(block);
        case "numbered_list_item":
          return `1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`;
        case "bulleted_list_item":
          return `- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`;
        case "divider":
          return "---";
        case "to_do":
          return `- [${block.to_do.checked ? "x" : " "}] ${richTextToMarkdown(
            block.to_do.rich_text
          )}`;
        case "quote":
          return `> ${richTextToMarkdown(block.quote.rich_text)}`;
        case "code":
          return `\`\`\`${block.code.language}\n${convertRichTextToPlainText(
            block.code.rich_text
          )}\n\`\`\``;
        case "bookmark":
          return `[${block.bookmark.url}](${block.bookmark.url})`;
        default:
          return "";
      }
    })
    .filter((markdown) => markdown !== "")
    .join("\n");
};

function coverImageToMarkdown(block: ImageBlockObjectResponse) {
  // 使用相對路徑，避免 Ngrok 警告頁面問題
  const proxyUrl = `${BASE_URL}/api/proxy/image?block_id=${block.id}`;
  // 獲取圖片標題，如果沒有則使用區塊 ID
  const caption =
    block.image.caption.length > 0
      ? convertRichTextToPlainText(block.image.caption)
      : block.id;
  return `![${caption}](${proxyUrl})`;
}

function fileToMarkdown(block: FileBlockObjectResponse) {
  // 使用相對路徑，避免 Ngrok 警告頁面問題
  const proxyUrl = `${BASE_URL}/api/proxy/file?block_id=${block.id}`;
  // 獲取檔案標題，如果沒有則使用區塊 ID
  const fileName = block.file.name;
  return `[${fileName}](${proxyUrl})`;
}
