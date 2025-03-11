import { IssueRepoInfo } from "@/lib/client";
export type NotionIssueConfig = {
  fields: {
    ISSUE_TITLE: string;
    ISSUE_BODY: string;
    ISSUE_TAG: string;
    ISSUE_LINK: string;
    STATUS: STATUS_VALUES;
    REPOS: string;
    FILES: string;
  };
  STATUS_VALUES: {
    [key: string]: string;
  };
  ALLOWED_REPOS: IssueRepoInfo[];
};
