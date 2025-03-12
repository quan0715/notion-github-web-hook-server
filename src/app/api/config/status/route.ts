import { NextResponse } from "next/server";

export async function GET() {
  // 檢查環境變數是否存在
  const notionToken = process.env.NOTION_SECRET ? true : false;
  const githubToken = process.env.GITHUB_TOKEN ? true : false;
  const baseUrl = process.env.BASE_URL ? true : false;

  // 檢查 Notion 資料庫配置
  // 這裡我們只檢查是否有導入配置，實際應用中可能需要更詳細的檢查
  let notionDatabase = false;
  try {
    // 嘗試導入 notionConfig
    const { NOTION_FIELDS } = await import(
      "../../../../lib/config/notionConfig"
    );
    notionDatabase = NOTION_FIELDS && Object.keys(NOTION_FIELDS).length > 0;
  } catch (error) {
    console.error("無法導入 Notion 配置:", error);
  }

  return NextResponse.json({
    notionToken,
    notionDatabase,
    githubToken,
    baseUrl,
  });
}
