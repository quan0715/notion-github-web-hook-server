import { Client, isNotionClientError } from "@notionhq/client";
import { NOTION_FIELDS } from "../config/notionConfig";
import { UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";

import { appendLogEntry } from "./notionLog";

if (!process.env.NOTION_SECRET) {
  throw new Error("NOTION_SECRET is not set");
}

export const notionClient = new Client({
  auth: process.env.NOTION_SECRET,
});

export async function NotionActionWrapper<T>({
  action,
  actionMessage = "",
  logId = undefined,
  retry = true,
  retryDelay = 500,
  retryLimit = 2,
}: {
  action: () => Promise<T>;
  actionMessage?: string;
  logId?: string | undefined;
  retry?: boolean;
  retryDelay?: number;
  retryLimit?: number;
}): Promise<T> {
  try {
    const res = await action();
    if (logId && actionMessage) {
      await appendLogEntry(logId, "info", actionMessage);
    }
    return res;
  } catch (error) {
    if (retry && retryLimit > 0) {
      if (logId && actionMessage) {
        await appendLogEntry(logId, "error", actionMessage);
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return await NotionActionWrapper({
        action,
        actionMessage,
        logId,
        retry: true,
        retryDelay,
        retryLimit: retryLimit - 1,
      });
    } else {
      if (isNotionClientError(error)) {
        if (logId && actionMessage && error.code !== "conflict_error") {
          await appendLogEntry(
            logId,
            "error",
            `Notion 操作失敗: ${error.code} ${error.message}`
          );
        }
        console.error(error.code, error.message);
      } else {
        console.error(error);
      }
      throw Error("重試失敗");
    }
  }
}

export const updateIssueStatus = async (
  pageId: string,
  status: string,
  logId: string | undefined = undefined
): Promise<UpdatePageResponse> => {
  return await NotionActionWrapper<UpdatePageResponse>({
    action: async () => {
      return await notionClient.pages.update({
        page_id: pageId,
        properties: {
          [NOTION_FIELDS.fields.STATUS.fieldName]: {
            type: "status",
            status: {
              name: status,
            },
          },
        },
      });
    },
    logId: logId,
    actionMessage: `Update page status to ${status}`,
  });
};

export const updateIssueLink = async (
  pageId: string,
  issueUrl: string,
  logId: string | undefined = undefined
): Promise<UpdatePageResponse> => {
  return await NotionActionWrapper<UpdatePageResponse>({
    action: async () => {
      return await notionClient.pages.update({
        page_id: pageId,
        properties: {
          [NOTION_FIELDS.fields.ISSUE_LINK.fieldName]: {
            type: "url",
            url: issueUrl,
          },
        },
      });
    },
    logId: logId,
    actionMessage: `Update issue link to ${issueUrl}`,
  });
};
