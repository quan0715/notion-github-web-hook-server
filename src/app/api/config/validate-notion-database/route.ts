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
      similarFields?: Array<{
        expected: string;
        actual: string;
        similarity: string;
      }>;
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

      // 建立資料庫欄位名稱的映射，以便進行不區分大小寫和空格的比較
      const propertyNameMap = new Map<string, string>();
      for (const propName in databaseProperties) {
        // 移除所有空格並轉為小寫，用於比較
        const normalizedName = propName.toLowerCase().replace(/\s+/g, "");
        propertyNameMap.set(normalizedName, propName);
      }

      // 記錄相似但不完全相同的欄位名稱
      const similarFields: Array<{
        expected: string;
        actual: string;
        similarity: string;
      }> = [];

      // 檢查欄位是否存在（不區分大小寫和空格）
      for (const field of requiredFields) {
        // 移除所有空格並轉為小寫，用於比較
        const normalizedFieldName = field.fieldName
          .toLowerCase()
          .replace(/\s+/g, "");
        const actualFieldName = propertyNameMap.get(normalizedFieldName);

        if (!actualFieldName) {
          // 欄位不存在，嘗試找到相似的欄位名稱
          let mostSimilarField = "";
          let highestSimilarity = 0;

          for (const propName in databaseProperties) {
            // 計算相似度（這裡使用一個簡單的方法，實際可以使用更複雜的算法）
            const similarity = calculateSimilarity(field.fieldName, propName);
            if (similarity > highestSimilarity && similarity > 0.5) {
              // 相似度閾值
              highestSimilarity = similarity;
              mostSimilarField = propName;
            }
          }

          if (mostSimilarField) {
            similarFields.push({
              expected: field.fieldName,
              actual: mostSimilarField,
              similarity: `${Math.round(highestSimilarity * 100)}%`,
            });
          }

          // 欄位不存在
          missingFields.push({
            name: field.fieldName,
            description: field.description,
          });
        } else {
          // 欄位存在，但名稱可能有大小寫或空格差異
          fieldTypes[field.fieldName] =
            databaseProperties[actualFieldName].type;

          // 如果欄位名稱有差異，添加到相似欄位列表
          if (actualFieldName !== field.fieldName) {
            similarFields.push({
              expected: field.fieldName,
              actual: actualFieldName,
              similarity: "名稱格式不同",
            });
            console.log(
              `欄位名稱不符: 預期 "${field.fieldName}", 實際 "${actualFieldName}"`
            );
          }
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
        // 移除所有空格並轉為小寫，用於比較
        const normalizedFieldName = fieldName.toLowerCase().replace(/\s+/g, "");
        const actualFieldName = propertyNameMap.get(normalizedFieldName);

        // 如果欄位存在但類型不符
        if (
          actualFieldName &&
          databaseProperties[actualFieldName] &&
          databaseProperties[actualFieldName].type !== fieldDef.type &&
          !missingFields.some((f) => f.name === fieldName)
        ) {
          invalidTypes.push({
            name: fieldName,
            expected: fieldDef.type,
            actual: databaseProperties[actualFieldName].type,
          });
        }
      }

      databaseResults.push({
        id: databaseId,
        title: databaseTitle,
        url: databaseUrl,
        missingFields,
        invalidTypes,
        similarFields: similarFields.length > 0 ? similarFields : undefined,
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

// 計算兩個字符串的相似度（使用 Levenshtein 距離的簡化版本）
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // 如果其中一個是另一個的子字符串，給予較高的相似度
  if (s1.includes(s2) || s2.includes(s1)) {
    const longerLength = Math.max(s1.length, s2.length);
    const shorterLength = Math.min(s1.length, s2.length);
    return shorterLength / longerLength;
  }

  // 移除空格後比較
  const s1NoSpace = s1.replace(/\s+/g, "");
  const s2NoSpace = s2.replace(/\s+/g, "");

  if (s1NoSpace === s2NoSpace) {
    return 0.9; // 非常相似，只是空格不同
  }

  // 簡單的字符匹配率
  let matches = 0;
  const maxLength = Math.max(s1.length, s2.length);
  const minLength = Math.min(s1.length, s2.length);

  for (let i = 0; i < minLength; i++) {
    if (s1[i] === s2[i]) {
      matches++;
    }
  }

  return matches / maxLength;
}
