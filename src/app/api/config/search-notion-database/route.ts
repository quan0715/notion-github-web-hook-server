import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { NOTION_FIELDS } from "../../../../lib/config/notionConfig";

export async function GET() {
  const notionToken = process.env.NOTION_SECRET;
  const databaseId = process.env.NOTION_DATABASE_ID;
  const databaseName = NOTION_FIELDS.DATABASE_NAME || "GitHub Issues";

  if (!notionToken) {
    return NextResponse.json({
      success: false,
      message: "Notion Token 未設定",
    });
  }

  try {
    // 初始化 Notion 客戶端
    const notion = new Client({ auth: notionToken });

    // 使用 search API 搜尋匹配的資料庫
    const response = await notion.search({
      query: databaseName,
      filter: {
        property: "object",
        value: "database",
      },
    });

    // 過濾出匹配的資料庫
    const matchingDatabases = response.results.filter(
      (result) => result.object === "database"
    );

    // 如果有指定的資料庫 ID，檢查它是否在搜尋結果中
    let currentDatabase = null;
    if (databaseId) {
      currentDatabase = matchingDatabases.find((db) => db.id === databaseId);
    }

    return NextResponse.json({
      success: true,
      message: `找到 ${matchingDatabases.length} 個匹配的資料庫`,
      details: {
        matchingDatabases: matchingDatabases.map((db: any) => ({
          id: db.id,
          title: db.title?.[0]?.plain_text || "未命名資料庫",
          url: db.url || "",
          isCurrent: db.id === databaseId,
        })),
        currentDatabase: currentDatabase
          ? {
              id: currentDatabase.id,
              title:
                (currentDatabase as any).title?.[0]?.plain_text ||
                "未命名資料庫",
              url: (currentDatabase as any).url || "",
            }
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `搜尋 Notion 資料庫時出錯: ${error.message || "未知錯誤"}`,
      details: error,
    });
  }
}
