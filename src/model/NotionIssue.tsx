import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NOTION_FIELDS } from "@/lib/config/notionConfig";
import { IssueRepoInfo } from "@/lib/client";

type NotionIssue = {
  title: string;
  labels: string[];
  issue_link: string;
  issue_id: number;
  repo: IssueRepoInfo | undefined;
};

export function NotionPageDto(notionPage: PageObjectResponse): NotionIssue {
  const titleField = notionPage.properties[NOTION_FIELDS.fields.ISSUE_TITLE];
  const labelsField = notionPage.properties[NOTION_FIELDS.fields.ISSUE_TAG];
  const reposField = notionPage.properties[NOTION_FIELDS.fields.REPOS];
  const issueLinkField = notionPage.properties[NOTION_FIELDS.fields.ISSUE_LINK];

  // 處理 issue_link 欄位
  let issueLinkValue = "";
  if (issueLinkField && issueLinkField.type === "url" && issueLinkField.url) {
    issueLinkValue = issueLinkField.url;
  }

  const issue_id = issueLinkValue
    ? parseInt(issueLinkValue.split("/").pop() || "0")
    : 0;

  // 處理 repo 欄位
  let issueRepo = undefined;
  if (reposField.type === "select") {
    const [owner, name] = reposField.select?.name.split("/") || [];
    // check if owner and repo are in ALLOWED_REPOS
    if (
      NOTION_FIELDS.ALLOWED_REPOS.some(
        (repo) => repo.owner === owner && repo.repo === name
      )
    ) {
      issueRepo = {
        owner,
        repo: name,
      };
    }
  }
  console.log(titleField);

  return {
    title:
      titleField.type === "title" ? titleField.title[0]?.plain_text || "" : "",
    labels:
      labelsField.type === "multi_select"
        ? labelsField.multi_select.map((label: { name: string }) => label.name)
        : [],
    issue_link: issueLinkValue,
    issue_id,
    repo: issueRepo,
  };
}

export default NotionIssue;
