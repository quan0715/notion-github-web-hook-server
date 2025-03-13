import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { Octokit } from "@octokit/rest";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("databaseId");

    if (!databaseId) {
      return NextResponse.json(
        { error: "Missing databaseId parameter" },
        { status: 400 }
      );
    }

    const notionToken = process.env.NOTION_TOKEN;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!notionToken) {
      return NextResponse.json(
        { error: "NOTION_TOKEN environment variable is not set" },
        { status: 500 }
      );
    }

    if (!githubToken) {
      return NextResponse.json(
        { error: "GITHUB_TOKEN environment variable is not set" },
        { status: 500 }
      );
    }

    const notion = new Client({ auth: notionToken });
    const octokit = new Octokit({ auth: githubToken });

    // 獲取資料庫中的儲存庫選項
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Repository",
        select: {
          is_not_empty: true,
        },
      },
    });

    // 提取唯一的儲存庫選項
    const repoOptionsMap = new Map();

    for (const page of response.results) {
      const properties = page.properties as any;

      if (properties.Repository && properties.Repository.select) {
        const option = properties.Repository.select;

        if (!repoOptionsMap.has(option.id)) {
          repoOptionsMap.set(option.id, {
            id: option.id,
            name: option.name,
            repoFullName: null,
            valid: false,
          });
        }
      }
    }

    // 檢查儲存庫名稱格式並驗證它們是否存在
    const options = Array.from(repoOptionsMap.values());

    for (const option of options) {
      // 嘗試從選項名稱中提取儲存庫全名
      const repoNameMatch = option.name.match(
        /([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/
      );

      if (repoNameMatch) {
        option.repoFullName = repoNameMatch[1];

        try {
          // 檢查儲存庫是否存在
          await octokit.repos.get({
            owner: option.repoFullName.split("/")[0],
            repo: option.repoFullName.split("/")[1],
          });

          option.valid = true;
        } catch (error) {
          option.valid = false;
          option.error = "儲存庫不存在或無法訪問";
        }
      } else {
        option.valid = false;
        option.error = "選項名稱不包含有效的儲存庫格式 (owner/repo)";
      }
    }

    return NextResponse.json({ options });
  } catch (error) {
    console.error("Error validating Notion repos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "發生未知錯誤" },
      { status: 500 }
    );
  }
}
