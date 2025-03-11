/**
 * Notion 數據庫欄位名稱配置
 * 當 Notion 資料庫欄位名稱變更時，只需要在這裡修改
 */
import { NotionIssueConfig } from "./index";

export const NOTION_FIELDS: NotionIssueConfig = {
  // 基本欄位
  fields: {
    ISSUE_TITLE: "Issue Title",
    ISSUE_BODY: "Issue Body",
    ISSUE_TAG: "Issue Tag",
    ISSUE_LINK: "issue_link",
    REPOS: "Repository",
    STATUS: "Status",
    FILES: "files",
  },
  STATUS_VALUES: {
    OPEN: "open",
    CLOSED: "closed",
  },
  ALLOWED_REPOS: [
    {
      owner: "quan0715",
      repo: "testRepo2",
    },
    {
      owner: "quan0715",
      repo: "test_repo",
    },
  ],
};
