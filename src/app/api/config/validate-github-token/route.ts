import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import type { RestEndpointMethodTypes } from "@octokit/rest";

type UserResponse =
  RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]["data"];

export async function GET() {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    return NextResponse.json({
      success: false,
      message: "GitHub Token 未設定",
    });
  }

  try {
    // 初始化 GitHub 客戶端
    const octokit = new Octokit({ auth: githubToken });

    // 驗證 token 是否有效，並獲取用戶資訊
    const { data: user } = await octokit.users.getAuthenticated();

    // 檢查 token 的權限範圍
    const tokenInfo = await octokit.request("GET /");
    const scopes = tokenInfo.headers["x-oauth-scopes"] || "未知";

    // 檢查是否是 fine-grained personal access token
    const isFineGrained =
      githubToken.startsWith("github_pat_") ||
      tokenInfo.headers["github-authentication-token-type"] === "fine-grained";

    return NextResponse.json({
      success: true,
      message: "GitHub Token 有效",
      details: {
        user: {
          login: user.login,
          name: user.name,
          id: user.id,
          avatar_url: user.avatar_url,
        },
        token_scopes: scopes,
        is_fine_grained: isFineGrained,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `GitHub Token 無效: ${error.message || "未知錯誤"}`,
      details: error,
    });
  }
}
