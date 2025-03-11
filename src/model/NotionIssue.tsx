import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NOTION_FIELDS } from "@/lib/config/notionConfig";
import { IssueRepoInfo } from "@/lib/client";
type NotionFile = {
  name: string;
  url: string;
};

type NotionIssue = {
  title: string;
  labels: string[];
  issue_link: string;
  issue_id: number;
  files: NotionFile[];
  repo: IssueRepoInfo | undefined;
};

type NotionExternalFile = {
  type?: "external";
  name: string;
  external: { url: string };
};

type NotionInternalFile = {
  type?: "file";
  name: string;
  file: { url: string; expiry_time: string };
};

type NotionFileObject = NotionExternalFile | NotionInternalFile;

function isExternalFile(file: NotionFileObject): file is NotionExternalFile {
  return file.type === "external";
}

function getFileUrl(file: NotionFileObject): string {
  if (isExternalFile(file)) {
    return file.external.url;
  }
  return file.file.url;
}

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

  // 處理 files 欄位
  // let filesArray: NotionFileObject[] = [];
  // const filesField = notionPage.properties[NOTION_FIELDS.fields.FILES];
  // if (filesField && filesField.type === "files") {
  //   filesArray = filesField.files as NotionFileObject[];
  // }

  const issue_id = issueLinkValue
    ? parseInt(issueLinkValue.split("/").pop() || "0")
    : 0;

  // const files = filesArray.map((file: NotionFileObject) => ({
  //   name: file.name,
  //   url: getFileUrl(file),
  // }));

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
    files: [],
    repo: issueRepo,
  };
}

export default NotionIssue;
