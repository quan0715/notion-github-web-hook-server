import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { NOTION_FIELDS } from "@/lib/config/notionConfig";

export async function GET(request: Request) {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    return NextResponse.json({
      success: false,
      message: "GitHub Token 未設定",
    });
  }

  try {
    // 從 URL 參數中獲取儲存庫信息
    const url = new URL(request.url);
    const repoParam = url.searchParams.get("repo");

    // 初始化 GitHub API 客戶端
    const octokit = new Octokit({ auth: githubToken });

    // 獲取當前用戶信息
    const { data: user } = await octokit.users.getAuthenticated();

    // 如果提供了特定的儲存庫，則驗證該儲存庫
    if (repoParam) {
      const [owner, repo] = repoParam.split("/");

      if (!owner || !repo) {
        return NextResponse.json({
          success: false,
          message: "儲存庫格式不正確，應為 'owner/repo'",
        });
      }

      try {
        const { data: repository } = await octokit.repos.get({
          owner,
          repo,
        });

        return NextResponse.json({
          success: true,
          message: "儲存庫驗證成功",
          details: {
            repository: {
              id: repository.id,
              name: repository.name,
              fullName: repository.full_name,
              description: repository.description,
              url: repository.html_url,
              owner: {
                login: repository.owner.login,
                avatar_url: repository.owner.avatar_url,
              },
              permissions: repository.permissions,
              isValid: true,
            },
          },
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          message: `儲存庫驗證失敗: ${error.message || "未知錯誤"}`,
          details: {
            repository: {
              fullName: `${owner}/${repo}`,
              isValid: false,
              error: error.message,
            },
          },
        });
      }
    }

    // 獲取用戶的儲存庫列表
    const { data: repositories } = await octokit.repos.listForAuthenticatedUser(
      {
        sort: "updated",
        per_page: 100,
      }
    );

    // 獲取用戶參與的組織
    const { data: orgs } = await octokit.orgs.listForAuthenticatedUser();

    // 獲取組織儲存庫
    let orgRepos: any[] = [];
    for (const org of orgs) {
      try {
        const { data: repos } = await octokit.repos.listForOrg({
          org: org.login,
          per_page: 100,
        });
        orgRepos = [...orgRepos, ...repos];
      } catch (error) {
        console.error(`無法獲取組織 ${org.login} 的儲存庫:`, error);
      }
    }

    // 合併用戶和組織儲存庫
    const allRepos = [...repositories, ...orgRepos];

    // 去重
    const uniqueRepos = Array.from(
      new Map(allRepos.map((repo) => [repo.id, repo])).values()
    );

    // 格式化儲存庫信息
    const formattedRepos = uniqueRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
      permissions: repo.permissions,
      isValid: true,
    }));

    return NextResponse.json({
      success: true,
      message: `找到 ${formattedRepos.length} 個可訪問的 GitHub 儲存庫`,
      details: {
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
        },
        repositories: formattedRepos,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `無法驗證 GitHub 儲存庫: ${error.message || "未知錯誤"}`,
      details: error,
    });
  }
}
