import { Octokit } from "octokit";

export const GithubClient = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getIssue = async (
  owner: string,
  repo: string,
  issueNumber: number
) => {
  try {
    const response = await GithubClient.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner,
        repo,
        issue_number: issueNumber,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    return response.data;
  } catch {
    return null;
  }
};

export const createIssue = async ({
  owner,
  repo,
  title,
  body,
  labels,
}: {
  owner: string;
  repo: string;
  title: string;
  body: string;
  labels: string[];
}) => {
  const response = await GithubClient.request(
    "POST /repos/{owner}/{repo}/issues",
    {
      owner,
      repo,
      title,
      body,
      labels,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return response.data;
};

export const updateIssue = async ({
  owner,
  repo,
  issueNumber,
  title,
  body,
  labels,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
  title: string;
  body: string;
  labels: string[];
}) => {
  const response = await GithubClient.request(
    "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
    {
      owner,
      repo,
      issue_number: issueNumber,
      title,
      body,
      labels,
      state: "open",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  return response.data;
};

export const isIssueExists = async (
  owner: string,
  repo: string,
  issueNumber: number
) => {
  const issue = await getIssue(owner, repo, issueNumber);
  return issue !== null;
};
