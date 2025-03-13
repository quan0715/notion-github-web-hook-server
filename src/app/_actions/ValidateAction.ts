// Check if the environment variables are valid
"use server";
import { Client, isFullDatabase } from "@notionhq/client";
import { NotionDatabaseValidateResponse } from "@/types";
import { convertRichTextToPlainText } from "@/lib/helper/notion";
import { NOTION_FIELDS } from "@/lib/config/notionConfig";
import { GithubClient } from "@/lib/server/GithubClient";
export async function validateEnv() {
  const requiredEnvVars = [
    { name: "NOTION_SECRET", description: "Notion API SECRET Key" },
    // { name: "ENV_MISSING_TEST", description: "環境變數缺失測試" },
    { name: "GITHUB_TOKEN", description: "GitHub API Token" },
    { name: "BASE_URL", description: "Application Base URL" },
    { name: "NOTION_DATABASE_ID", description: "Notion Database ID" },
  ];

  const envVarsInfo = requiredEnvVars.map((envVar) => ({
    ...envVar,
    isSet: process.env[envVar.name] ? true : false,
  }));

  const missingEnvVars = envVarsInfo.filter((envVar) => !envVar.isSet);
  if (missingEnvVars.length > 0) {
    return {
      success: false,
      message: `缺少必要的環境變數: ${missingEnvVars
        .map((env) => env.name)
        .join(", ")}`,
      details: {
        envVarsInfo: envVarsInfo,
      },
    };
  }

  return {
    success: true,
    message: "所有必要的環境變數已設置",
    details: {
      envVarsInfo: envVarsInfo,
    },
  };
}

export async function validateNotionDatabase() {
  const DB_ID = process.env.NOTION_DATABASE_ID;
  if (!DB_ID) {
    return {
      success: false,
      message: "Notion Database ID 未設定",
    };
  }

  const notion = new Client({ auth: process.env.NOTION_SECRET });
  const database = await notion.databases.retrieve({
    database_id: DB_ID,
  });
  if (!isFullDatabase(database)) {
    return {
      success: false,
      message: "Notion Database ID 未設定",
    };
  }
  console.log(database);

  // 檢查 Missing Fields
  const requiredFields = Object.entries(NOTION_FIELDS.fields).filter(
    ([field, config]) => config.required
  );
  const missingFields = requiredFields.filter(([field, config]) => {
    const property = database.properties[config.fieldName];
    return !property || property.name !== config.fieldName;
  });

  // 檢查 Invalid Types
  const invalidTypes = requiredFields.filter(([field, config]) => {
    const property = database.properties[config.fieldName];
    return property && property.type !== config.type;
  });

  const _isValid = missingFields.length === 0 && invalidTypes.length === 0;

  const databaseValidateDetails: NotionDatabaseValidateResponse = {
    id: database.id,
    title: convertRichTextToPlainText(database.title),
    url: database.url,
    missingFields: missingFields.map(([field, config]) => ({
      fieldName: field,
      description: config.description || "",
      expectedType: config.type,
      expected: config.fieldName,
      actualName: field,
    })),
    invalidTypes: invalidTypes.map(([field, config]) => ({
      fieldName: field,
      expected: config.type,
      actual: database.properties[field].type,
    })),
    isValid: _isValid,
  };
  console.log(databaseValidateDetails);
  return {
    success: true,
    message: "Notion Database ID 已設定",
    details: { database: databaseValidateDetails },
  };
}

async function getRepoListFromNotionDB(dbId: string) {
  const notion = new Client({ auth: process.env.NOTION_SECRET });
  const database = await notion.databases.retrieve({
    database_id: dbId,
  });
  if (!isFullDatabase(database)) {
    return [];
  }
  const fieldName = NOTION_FIELDS.fields.REPOS.fieldName;
  const dbField = database.properties[fieldName];
  if (!dbField) {
    return [];
  }

  if (dbField.type === "select") {
    return dbField.select.options.map((repo) => {
      const [repoName, repoOwner] = repo.name.split("/");
      return {
        repoName,
        repoOwner,
      };
    });
  }
  return [];
}

export async function validateNotionDatabaseRepos() {
  const DB_ID = process.env.NOTION_DATABASE_ID;
  if (!DB_ID) {
    return {
      success: false,
      message: "Notion Database ID 未設定",
    };
  }
  const repos = await getRepoListFromNotionDB(DB_ID);
  if (repos.length === 0) {
    return {
      success: false,
      message: "Notion Database 中沒有任何儲存庫",
    };
  }
  return {
    success: true,
    message: "成功",
    details: { repos },
  };
}

export async function validateNotionApi() {
  const notionToken = process.env.NOTION_SECRET;

  if (!notionToken) {
    return {
      success: false,
      message: "Notion Token 未設定",
    };
  }

  try {
    // 初始化 Notion 客戶端
    const notion = new Client({ auth: notionToken });

    // 使用 users.list 獲取當前用戶資訊（包括機器人）
    const response = await notion.users.list({});
    const currentUser = response.results[0];

    return {
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
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Notion Token 無效: ${error.message || "未知錯誤"}`,
      details: error,
    };
  }
}

export async function validateGitHubApi() {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return {
      success: false,
      message: "GitHub API Token 未設定",
    };
  }
  try {
    const github = GithubClient;
    const user = await github.request("GET /user");
    if (!user) {
      return {
        success: false,
        message: "GitHub API Token 無效",
      };
    }

    const tokenInfo = await github.request("GET /");
    const expiresAt =
      tokenInfo.headers["github-authentication-token-expiration"]?.toString();
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    const isExpired = expiresAtDate ? expiresAtDate < new Date() : false;

    // check expired
    // github-authentication-token-expiration
    // const isExpired =
    const isFineGrained =
      githubToken.startsWith("github_pat_") ||
      tokenInfo.headers["github-authentication-token-type"] === "fine-grained";

    return {
      success: true,
      message: "GitHub API Token 已設定",
      details: {
        user: {
          login: user.data.login,
          name: user.data.name,
          id: user.data.id,
          avatar_url: user.data.avatar_url,
        },
        is_fine_grained: isFineGrained,
        is_expired: isExpired,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `GitHub Token 無效: ${error.message || "未知錯誤"}`,
      details: {
        error: error,
      },
    };
  }
}
