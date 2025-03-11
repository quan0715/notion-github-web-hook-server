import { isFullBlock, collectPaginatedAPI } from "@notionhq/client";
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { convertRichTextToPlainText, ApiColor } from "../helper/notion";
import { notionClient, NotionActionWrapper } from "./notionClient";
// Log Block 相關常量和類型
const LOG_BLOCK_TYPE = "callout";
const LOG_TITLE = "Notion Action Log";
const LogEmoji = "📋";
const LogColor = "blue_background";
const TIMESTAMP_FORMAT = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

type LogEntryOption = "info" | "error" | "warning" | "success";

export const isLogBlock = (
  block: BlockObjectResponse | PartialBlockObjectResponse
): boolean => {
  if (!isFullBlock(block)) {
    return false;
  }
  if (block.type !== LOG_BLOCK_TYPE) {
    return false;
  }
  if (convertRichTextToPlainText(block.callout.rich_text) !== LOG_TITLE) {
    return false;
  }
  return true;
};

export const initializedLogBlock = async (pageId: string): Promise<string> => {
  return await NotionActionWrapper<string>({
    action: () => _initializedLogBlock(pageId),
  });
};

const _initializedLogBlock = async (pageId: string): Promise<string> => {
  // check if the log block is already created
  const blocks = await collectPaginatedAPI(notionClient.blocks.children.list, {
    block_id: pageId,
  });

  if (blocks.length) {
    const reversedBlocks = blocks.reverse();
    for (const block of reversedBlocks) {
      if (isLogBlock(block)) {
        // clear the children
        await notionClient.blocks.delete({
          block_id: block.id,
        });
      }
    }
  }

  // if not, create a new log block
  const response = await notionClient.blocks.children.append({
    block_id: pageId,
    children: [
      {
        type: LOG_BLOCK_TYPE,
        callout: {
          rich_text: [
            {
              type: "text",
              text: {
                content: LOG_TITLE,
              },
              annotations: {
                bold: true,
              },
            },
          ],
          icon: {
            type: "emoji",
            emoji: LogEmoji,
          },
          color: LogColor,
        },
      },
    ],
  });
  const logId = response.results[0].id;
  await appendLogEntry(logId, "info", "Log 初始化");
  return logId;
};

export const appendLogEntry = async (
  logId: string,
  logType: LogEntryOption = "info",
  message: string
): Promise<void> => {
  return await NotionActionWrapper<void>({
    action: () => _appendLogEntry(logId, logType, message),
  });
};

const _appendLogEntry = async (
  logId: string,
  logType: LogEntryOption,
  message: string
): Promise<void> => {
  const timestamp = TIMESTAMP_FORMAT.format(new Date());
  let color: ApiColor = "default";
  let icon: string = "";
  switch (logType) {
    case "info":
      color = "blue";
      icon = "📝";
      break;
    case "error":
      color = "red";
      icon = "❌";
      break;
    case "warning":
      color = "yellow";
      icon = "⚠️";
      break;
    case "success":
      color = "green";
      break;
    default:
      break;
  }

  await notionClient.blocks.children.append({
    block_id: logId,
    children: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: `[${icon}] ` },
              annotations: { color: color },
            },
            {
              type: "text",
              text: { content: message },
              annotations: { color: color, bold: true },
            },
            {
              type: "text",
              text: { content: ` [${timestamp}]` },
              annotations: { color: "gray" },
            },
          ],
        },
      },
    ],
  });
};
