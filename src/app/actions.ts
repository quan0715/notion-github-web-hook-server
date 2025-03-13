"use server";

import { revalidatePath } from "next/cache";

export async function validateNotionRepos(databaseId: string) {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/config/validate-notion-repos?database_id=${databaseId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`驗證失敗: ${response.statusText}`);
    }

    const data = await response.json();

    // 重新驗證頁面
    revalidatePath("/");

    return data;
  } catch (error) {
    console.error("驗證 Notion 儲存庫選項時出錯:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "未知錯誤",
      options: [],
    };
  }
}
