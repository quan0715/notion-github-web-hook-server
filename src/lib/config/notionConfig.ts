/**
 * Notion 數據庫欄位名稱配置
 * 當 Notion 資料庫欄位名稱變更時，只需要在這裡修改
 */
import { NotionIssueConfig } from "./index";

export const NOTION_FIELDS: NotionIssueConfig = {
  // 基本欄位
  fields: {
    ISSUE_TITLE: {
      fieldName: "Issue Title",
      type: "title",
      required: true,
      description: "GitHub Issue 的標題",
    },
    ISSUE_TAG: {
      fieldName: "Issue Tag",
      type: "multi_select",
      required: true,
      description: "GitHub Issue 的標籤",
    },
    ISSUE_LINK: {
      fieldName: "issue_link",
      type: "url",
      required: true,
      description: "GitHub Issue 的連結",
    },
    REPOS: {
      fieldName: "Repository",
      type: "select",
      required: true,
      description: "GitHub 儲存庫",
    },
    STATUS: {
      fieldName: "Status",
      type: "status",
      required: true,
      description: "GitHub Issue 的狀態",
    },
    TEST_FIELD_MISS: {
      fieldName: "TEST_FIELD_MISS",
      type: "rich_text",
      required: false,
      description: "測試欄位缺失",
    },
    TEST_FIELD_NAME_WRONG: {
      fieldName: "TEST_FIELD_NAME_WRONG",
      type: "rich_text",
      required: false,
      description: "測試欄位名稱錯誤",
    },
    TEST_FIELD_INVALID: {
      fieldName: "TEST_FIELD_INVALID",
      type: "select",
      required: false,
      description: "測試欄位類型錯誤",
    },
  },
  STATUS_VALUES: {
    OPEN: "open",
    CLOSED: "closed",
  },
  DATABASE_NAME: "Issue Report Demo",
};
