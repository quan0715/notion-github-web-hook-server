import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET() {
  const notionToken = process.env.NOTION_SECRET;

  if (!notionToken) {
    return NextResponse.json({
      success: false,
      message: "Notion Token 未設定",
    });
  }

  try {
    // 初始化 Notion 客戶端
    const notion = new Client({ auth: notionToken });

    // 使用 users.list 獲取當前用戶資訊（包括機器人）
    const response = await notion.users.list({});
    const currentUser = response.results[0];

    return NextResponse.json({
      success: true,
      message: "Notion Token 有效",
      details: {
        user: {
          id: currentUser.id,
          name: currentUser.name,
          avatar_url: currentUser.avatar_url,
          type: currentUser.type,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `Notion Token 無效: ${error.message || "未知錯誤"}`,
      details: error,
    });
  }
}
