"use client";

import { useState, useEffect } from "react";
import { StatusCard } from "@/components/StatusCard";
import { ResourceLink } from "@/components/ResourceLink";
import { UserInfoCard } from "@/components/UserInfoCard";
import {
  NotionDatabaseCard,
  RepositoryValidationResult,
} from "@/components/NotionDatabaseCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import {
  ConfigStatus,
  ValidationResult,
  NotionDatabase,
  GitHubUser,
  NotionUser,
  NotionRepoOption,
} from "@/types";

export default function Home() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    notionToken: false,
    notionDatabase: false,
    githubToken: false,
    baseUrl: false,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [validating, setValidating] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [validDatabases, setValidDatabases] = useState<NotionDatabase[]>([]);
  const [allDatabases, setAllDatabases] = useState<NotionDatabase[]>([]);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [notionUser, setNotionUser] = useState<NotionUser | null>(null);
  const [tokenScopes, setTokenScopes] = useState<string[] | null>(null);
  const [notionRepoOptions, setNotionRepoOptions] = useState<
    NotionRepoOption[]
  >([]);
  const [validatingRepos, setValidatingRepos] = useState<string | null>(null);
  const [isFineGrained, setIsFineGrained] = useState<boolean>(false);

  useEffect(() => {
    // 檢查配置狀態
    const checkConfig = async () => {
      try {
        const response = await fetch("/api/config/status");
        const data = await response.json();
        setConfigStatus(data);
        setLoading(false);
      } catch (error) {
        console.error("檢查配置狀態時出錯:", error);
        setLoading(false);
      }
    };

    checkConfig();
  }, []);

  const validateNotionToken = async () => {
    setValidating("notion");
    setValidationResult(null);
    setValidDatabases([]);
    setAllDatabases([]);
    setNotionUser(null);
    try {
      const response = await fetch("/api/config/validate-notion-token");
      const data = await response.json();
      setValidationResult(data);

      if (data.success && data.details && data.details.user) {
        setNotionUser(data.details.user);
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: "驗證過程中發生錯誤",
      });
    } finally {
      setValidating(null);
    }
  };

  const validateNotionDatabase = async () => {
    setValidating("database");
    setValidationResult(null);
    setValidDatabases([]);
    setAllDatabases([]);
    try {
      const response = await fetch("/api/config/validate-notion-database");
      const data = await response.json();
      setValidationResult(data);
      if (data.success && data.details) {
        setValidDatabases(data.details.validDatabases || []);
        setAllDatabases(data.details.allDatabases || []);
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: "驗證過程中發生錯誤",
      });
    } finally {
      setValidating(null);
    }
  };

  const validateGithubToken = async () => {
    setValidating("github");
    setValidationResult(null);
    setValidDatabases([]);
    setAllDatabases([]);
    setGithubUser(null);
    setTokenScopes(null);
    setIsFineGrained(false);

    try {
      const response = await fetch("/api/config/validate-github-token");
      const data = await response.json();
      setValidationResult(data);

      if (data.success && data.details) {
        setGithubUser(data.details.user || null);
        if (data.details.token_scopes) {
          setTokenScopes(
            Array.isArray(data.details.token_scopes)
              ? data.details.token_scopes
              : data.details.token_scopes
                  .split(",")
                  .map((s: string) => s.trim())
          );
        }
        setIsFineGrained(data.details.is_fine_grained || false);
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: "驗證過程中發生錯誤",
      });
    } finally {
      setValidating(null);
    }
  };

  const validateNotionRepos = async (databaseId: string) => {
    setValidatingRepos(databaseId);
    setNotionRepoOptions([]);
    setTokenScopes(null);
    setIsFineGrained(false);

    try {
      const response = await fetch(
        `/api/config/validate-notion-repos?database_id=${databaseId}`
      );
      const data = await response.json();

      if (data.success && data.details && data.details.repositories) {
        setNotionRepoOptions(data.details.repositories);
        if (data.details.token_scopes) {
          setTokenScopes(
            Array.isArray(data.details.token_scopes)
              ? data.details.token_scopes
              : data.details.token_scopes
                  .split(",")
                  .map((s: string) => s.trim())
          );
        }
        setIsFineGrained(data.details.is_fine_grained || false);
      } else {
        setValidationResult({
          success: false,
          message: data.message || "無法驗證儲存庫選項",
        });
      }
    } catch (error) {
      setValidationResult({
        success: false,
        message: "驗證儲存庫選項過程中發生錯誤",
      });
    } finally {
      setValidatingRepos(null);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-muted/40">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold break-words">
              Notion-GitHub Webhook 配置狀態
            </CardTitle>
            <CardDescription>
              檢查和驗證您的 Notion-GitHub Webhook 配置
            </CardDescription>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>環境變數狀態</CardTitle>
                <CardDescription>檢查必要的環境變數是否已配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatusCard
                    title="Notion Token"
                    status={configStatus.notionToken}
                    description="用於訪問 Notion API 的令牌"
                  />
                  <StatusCard
                    title="Notion 資料庫"
                    status={configStatus.notionDatabase}
                    description="Notion 資料庫配置"
                  />
                  <StatusCard
                    title="GitHub Token"
                    status={configStatus.githubToken}
                    description="用於訪問 GitHub API 的令牌"
                  />
                  <StatusCard
                    title="基礎 URL"
                    status={configStatus.baseUrl}
                    description="應用程式的基礎 URL"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>驗證工具</CardTitle>
                <CardDescription>測試您的配置是否正確</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={validateNotionToken}
                    disabled={validating === "notion"}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  >
                    {validating === "notion" ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <img
                          src="https://www.notion.so/images/favicon.ico"
                          alt="Notion"
                          className="w-6 h-6 flex-shrink-0"
                        />
                      </div>
                    )}
                    <span className="font-medium text-center">
                      {validating === "notion"
                        ? "驗證中..."
                        : "驗證 Notion Token"}
                    </span>
                  </Button>
                  <Button
                    onClick={validateNotionDatabase}
                    disabled={validating === "database"}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                  >
                    {validating === "database" ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <img
                          src="https://www.notion.so/images/favicon.ico"
                          alt="Notion"
                          className="w-6 h-6 flex-shrink-0"
                        />
                      </div>
                    )}
                    <span className="font-medium text-center">
                      {validating === "database"
                        ? "驗證中..."
                        : "驗證 Notion 資料庫"}
                    </span>
                  </Button>
                  <Button
                    onClick={validateGithubToken}
                    disabled={validating === "github"}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-200 transition-colors"
                  >
                    {validating === "github" ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <img
                          src="https://github.com/favicon.ico"
                          alt="GitHub"
                          className="w-6 h-6 flex-shrink-0"
                        />
                      </div>
                    )}
                    <span className="font-medium text-center">
                      {validating === "github"
                        ? "驗證中..."
                        : "驗證 GitHub Token"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {validationResult && (
              <Alert
                variant={validationResult.success ? "default" : "destructive"}
              >
                <div className="flex items-center gap-2">
                  {validationResult.success ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <AlertTitle className="break-words">
                    {validationResult.success ? "驗證成功" : "驗證失敗"}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  <p className="mb-2 break-words">{validationResult.message}</p>
                  {validationResult.details && (
                    <Card className="mt-4 bg-muted/50">
                      <CardContent className="p-4">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(validationResult.details, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {validationResult && validationResult.success && notionUser && (
              <UserInfoCard
                type="notion"
                user={notionUser}
                tokenScopes={tokenScopes}
                isFineGrained={isFineGrained}
              />
            )}

            {validDatabases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>符合要求的 Notion 資料庫</CardTitle>
                  <CardDescription>
                    找到 {validDatabases.length} 個符合要求的資料庫
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {validDatabases.map((db) => (
                      <NotionDatabaseCard
                        key={db.id}
                        db={db}
                        // isValid={true}
                        validatingRepos={validatingRepos}
                        notionRepoOptions={notionRepoOptions}
                        validateNotionRepos={validateNotionRepos}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {allDatabases.length > 0 &&
              validDatabases.length < allDatabases.length && (
                <Card>
                  <CardHeader>
                    <CardTitle>不符合要求的 Notion 資料庫</CardTitle>
                    <CardDescription>
                      找到 {allDatabases.length - validDatabases.length}{" "}
                      個不符合要求的資料庫
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {allDatabases
                        .filter((db) => !db.isValid)
                        .map((db) => (
                          <NotionDatabaseCard
                            key={db.id}
                            db={db}
                            // isValid={false}
                            validatingRepos={validatingRepos}
                            notionRepoOptions={[]}
                            validateNotionRepos={validateNotionRepos}
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {validationResult && validationResult.success && githubUser && (
              <UserInfoCard
                type="github"
                user={githubUser}
                tokenScopes={tokenScopes}
                isFineGrained={isFineGrained}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>文檔與資源</CardTitle>
                <CardDescription>有用的連結和參考資料</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResourceLink
                    href="https://developers.notion.com/"
                    title="Notion API 文檔"
                    icon="notion"
                  />
                  <ResourceLink
                    href="https://docs.github.com/en/rest"
                    title="GitHub API 文檔"
                    icon="github"
                  />
                  <ResourceLink
                    href="https://vercel.com/docs"
                    title="Vercel 部署文檔"
                    icon="vercel"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
