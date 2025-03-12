// Notion 資料庫屬性類型
export type NotionPropertyType =
  | "title"
  | "rich_text"
  | "multi_select"
  | "select"
  | "url"
  | "status"
  | "files"
  | "date"
  | "checkbox"
  | "number"
  | "email"
  | "phone_number"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by";

// 欄位定義結構
export type NotionFieldDefinition = {
  fieldName: string; // Notion 資料庫中的欄位名稱
  type: NotionPropertyType; // 欄位類型
  required?: boolean; // 是否必須
  description?: string; // 欄位描述
};

export type NotionIssueConfig = {
  fields: {
    ISSUE_TITLE: NotionFieldDefinition;
    ISSUE_TAG: NotionFieldDefinition;
    ISSUE_LINK: NotionFieldDefinition;
    STATUS: NotionFieldDefinition;
    REPOS: NotionFieldDefinition;
    [key: string]: NotionFieldDefinition;
  };
  STATUS_VALUES: {
    [key: string]: string;
  };
  DATABASE_NAME?: string;
};
