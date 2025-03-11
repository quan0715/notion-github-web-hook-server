import { NextRequest } from "next/server";
import { NotionPageDto } from "@/model/NotionIssue";
import { getIssue, createIssue, updateIssue } from "@/lib/client/githubClient";
import { updateIssueStatus, updateIssueLink } from "@/lib/client/notionClient";
import { initializedLogBlock, appendLogEntry } from "@/lib/client/notionLog";
import { notionToMarkdown } from "@/lib/client/notionMarkdown";
export async function POST(request: NextRequest) {
  const messages = await request.json();
  const pageId = messages.data.id;
  const logId = await initializedLogBlock(pageId);
  await appendLogEntry(logId, "info", "Webhook 觸發");
  try {
    const notionIssue = NotionPageDto(messages.data);

    // check if repo is empty
    if (!notionIssue.repo) {
      throw new Error("Repo is empty");
    }
    const { owner, repo } = notionIssue.repo;
    await appendLogEntry(logId, "info", `上游 repo: ${owner}/${repo}`);
    const body = await notionToMarkdown(pageId);
    console.log(body);
    const issue = notionIssue.issue_id
      ? await getIssue(owner, repo, notionIssue.issue_id)
      : null;
    const issueExists = !!issue;

    if (issueExists) {
      await appendLogEntry(logId, "info", "Issue 已存在，更新 Issue");
      const issue = await updateIssue({
        owner,
        repo,
        issueNumber: notionIssue.issue_id,
        title: notionIssue.title,
        body,
        labels: notionIssue.labels,
      });
      await updateIssueStatus(pageId, issue.state);
      await updateIssueLink(pageId, issue.html_url);
      await appendLogEntry(logId, "info", "Issue 更新成功");
    } else {
      await appendLogEntry(logId, "info", "Issue 不存在，創建新 Issue");
      const newIssue = await createIssue({
        owner,
        repo,
        title: notionIssue.title,
        body,
        labels: notionIssue.labels,
      });
      await updateIssueLink(pageId, newIssue.html_url);
      await appendLogEntry(
        logId,
        "info",
        `Issue 創建成功: ${newIssue.html_url}`
      );
      await updateIssueStatus(pageId, newIssue.state);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    await appendLogEntry(logId, "error", `Webhook 異常: ${error}`);
    return new Response("Internal Server Error", { status: 500 });
  }
}
