import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { NOTION_FIELDS } from "../../../../lib/config/notionConfig";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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

    // 搜尋符合條件的資料庫
    const response = await notion.search({
      filter: {
        property: "object",
        value: "database",
      },
      page_size: 10,
    });

    if (response.results.length === 0) {
      return NextResponse.json({
        success: false,
        message: "未找到任何 Notion 資料庫，請確認整合權限是否正確",
      });
    }

    // 檢查每個資料庫的結構
    const databaseResults: Array<{
      id: string;
      title: string;
      url: string;
      missingFields: Array<{ name: string; description: string }>;
      invalidTypes: Array<{ name: string; expected: string; actual: string }>;
      isValid: boolean;
    }> = [];

    for (const db of response.results) {
      if (db.object !== "database") continue;

      const database = db as DatabaseObjectResponse;
      const databaseId = database.id;
      const databaseTitle = database.title?.[0]?.plain_text || "未命名資料庫";
      const databaseUrl = database.url || "";

      // 獲取所有必要欄位
      const requiredFields = Object.entries(NOTION_FIELDS.fields)
        .filter(([_, fieldDef]) => fieldDef.required)
        .map(([key, fieldDef]) => ({
          key,
          fieldName: fieldDef.fieldName,
          type: fieldDef.type,
          description: fieldDef.description || "",
        }));

      const missingFields: Array<{ name: string; description: string }> = [];
      const fieldTypes: Record<string, string> = {};
      const databaseProperties = database.properties;

      // 檢查欄位是否存在
      for (const field of requiredFields) {
        if (!databaseProperties[field.fieldName]) {
          missingFields.push({
            name: field.fieldName,
            description: field.description,
          });
        } else {
          fieldTypes[field.fieldName] =
            databaseProperties[field.fieldName].type;
        }
      }

      // 檢查欄位類型是否符合要求
      const invalidTypes: Array<{
        name: string;
        expected: string;
        actual: string;
      }> = [];

      for (const [key, fieldDef] of Object.entries(NOTION_FIELDS.fields)) {
        const fieldName = fieldDef.fieldName;

        // 如果欄位存在但類型不符
        if (
          databaseProperties[fieldName] &&
          databaseProperties[fieldName].type !== fieldDef.type &&
          !missingFields.some((f) => f.name === fieldName)
        ) {
          invalidTypes.push({
            name: fieldName,
            expected: fieldDef.type,
            actual: databaseProperties[fieldName].type,
          });
        }
      }

      databaseResults.push({
        id: databaseId,
        title: databaseTitle,
        url: databaseUrl,
        missingFields,
        invalidTypes,
        isValid: missingFields.length === 0 && invalidTypes.length === 0,
      });
    }

    // 找出有效的資料庫
    const validDatabases = databaseResults.filter((db) => db.isValid);

    if (validDatabases.length > 0) {
      return NextResponse.json({
        success: true,
        message: `找到 ${validDatabases.length} 個符合要求的 Notion 資料庫`,
        details: {
          validDatabases,
          allDatabases: databaseResults,
        },
      });
    } else {
      // 準備必要欄位列表
      const requiredFieldsList = Object.entries(NOTION_FIELDS.fields)
        .filter(([_, fieldDef]) => fieldDef.required)
        .map(([key, fieldDef]) => ({
          name: fieldDef.fieldName,
          type: fieldDef.type,
          description: fieldDef.description || "",
        }));

      return NextResponse.json({
        success: false,
        message: "未找到符合要求的 Notion 資料庫",
        details: {
          databases: databaseResults,
          requiredFields: requiredFieldsList,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `無法驗證 Notion 資料庫: ${error.message || "未知錯誤"}`,
      details: error,
    });
  }
}

// // 輔助函數：獲取欄位的預期類型
// function getExpectedType(field: string): string {
//   return NOTION_FIELDS.fieldTypes[field] || "未知";
// }
