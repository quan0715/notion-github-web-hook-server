import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { Octokit } from "@octokit/rest";
import { NOTION_FIELDS } from "@/lib/config/notionConfig";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function GET(request: Request) {
  const notionToken = process.env.NOTION_SECRET;
  const githubToken = process.env.GITHUB_TOKEN;
  const url = new URL(request.url);
  const databaseId = url.searchParams.get("database_id");

  if (!notionToken || !githubToken) {
    return NextResponse.json({
      success: false,
      message: "Notion Token 或 GitHub Token 未設定",
    });
  }

  if (!databaseId) {
    return NextResponse.json({
      success: false,
      message: "未提供資料庫 ID",
    });
  }

  try {
    // 初始化 Notion 客戶端
    const notion = new Client({ auth: notionToken });

    // 初始化 GitHub 客戶端
    const octokit = new Octokit({ auth: githubToken });

    // 檢查 token 的權限範圍
    const tokenInfo = await octokit.request("GET /");
    const scopes = tokenInfo.headers["x-oauth-scopes"] || "未知";

    // 檢查是否是 fine-grained personal access token
    const isFineGrained =
      githubToken.startsWith("github_pat_") ||
      tokenInfo.headers["github-authentication-token-type"] === "fine-grained";

    // 獲取資料庫信息
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });

    // 獲取 Repository 欄位
    const reposFieldName = NOTION_FIELDS.fields.REPOS.fieldName;
    const reposField = database.properties[reposFieldName];

    if (!reposField || reposField.type !== "select") {
      return NextResponse.json({
        success: false,
        message: `資料庫中沒有名為 "${reposFieldName}" 的 select 類型欄位`,
      });
    }

    // 獲取 Repository 欄位的選項
    const repoOptions = reposField.select?.options || [];

    if (repoOptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "無指定的 Repo",
        details: {
          databaseId,
          reposField: reposFieldName,
          token_scopes: scopes,
          is_fine_grained: isFineGrained,
          repositories: [],
          allValid: true,
        },
      });
    }

    // 驗證每個儲存庫選項
    const validationResults = [];

    for (const option of repoOptions) {
      const repoName = option.name;
      const [owner, repo] = repoName.split("/");

      if (!owner || !repo) {
        validationResults.push({
          name: repoName,
          isValid: false,
          error: "儲存庫格式不正確，應為 'owner/repo'",
        });
        continue;
      }

      try {
        // 檢查儲存庫是否存在
        const { data: repository } = await octokit.repos.get({
          owner,
          repo,
        });

        // 檢查儲存庫是否啟用 Issues 功能
        if (!repository.has_issues) {
          validationResults.push({
            name: repoName,
            isValid: false,
            error: "此儲存庫未啟用 Issues 功能",
            url: repository.html_url,
            private: repository.private,
          });
          continue;
        }

        // 檢查是否有權限創建和編輯 Issues
        let hasPermission = false;

        // 檢查權限
        if (repository.permissions) {
          // 需要 push 或 admin 權限才能創建和編輯 Issues
          hasPermission =
            repository.permissions.push || repository.permissions.admin;
        }

        if (hasPermission) {
          // 嘗試創建一個測試 Issue 來驗證權限
          try {
            // 創建一個測試 Issue
            const { data: issue } = await octokit.issues.create({
              owner,
              repo,
              title: "測試權限 - 將被刪除",
              body: "這是一個測試 Issue，用於驗證 GitHub Token 的權限。此 Issue 將被自動刪除。",
            });

            // 關閉測試 Issue
            await octokit.issues.update({
              owner,
              repo,
              issue_number: issue.number,
              state: "closed",
            });

            // 如果成功創建和關閉 Issue，則表示有權限
            validationResults.push({
              name: repoName,
              isValid: true,
              hasIssues: true,
              canCreateIssues: true,
              canEditIssues: true,
              url: repository.html_url,
              description: repository.description,
              permission: repository.permissions?.admin ? "admin" : "write",
              private: repository.private,
            });
          } catch (error: any) {
            // 如果無法創建或編輯 Issue，則可能是權限問題
            validationResults.push({
              name: repoName,
              isValid: false,
              hasIssues: true,
              canCreateIssues: false,
              canEditIssues: false,
              error: `無法創建或編輯 Issues: ${error.message}`,
              url: repository.html_url,
              private: repository.private,
            });
          }
        } else {
          // 沒有足夠的權限
          validationResults.push({
            name: repoName,
            isValid: false,
            hasIssues: true,
            canCreateIssues: false,
            canEditIssues: false,
            error: "您沒有在此儲存庫創建和編輯 Issues 的權限",
            url: repository.html_url,
            private: repository.private,
          });
        }
      } catch (error: any) {
        // 無法訪問儲存庫
        validationResults.push({
          name: repoName,
          isValid: false,
          error: `無法訪問儲存庫: ${error.message}`,
        });
      }
    }

    // 檢查是否所有儲存庫都有效
    const allValid = validationResults.every((result) => result.isValid);

    return NextResponse.json({
      success: true,
      message: allValid
        ? "所有儲存庫選項都有效且可操作"
        : "部分儲存庫選項無效或無法操作",
      details: {
        databaseId,
        reposField: reposFieldName,
        token_scopes: scopes,
        is_fine_grained: isFineGrained,
        repositories: validationResults,
        allValid,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `無法驗證儲存庫選項: ${error.message || "未知錯誤"}`,
      details: error,
    });
  }
}
