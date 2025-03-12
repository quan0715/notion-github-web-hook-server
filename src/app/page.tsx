"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

interface ConfigStatus {
  notionToken: boolean;
  notionDatabase: boolean;
  githubToken: boolean;
  baseUrl: boolean;
}

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
}

interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  missingFields: Array<{ name: string; description: string }>;
  invalidTypes: Array<{ name: string; expected: string; actual: string }>;
  isValid: boolean;
}

interface GitHubUser {
  login: string;
  name: string;
  id: number;
  avatar_url: string;
}

interface NotionUser {
  id: string;
  name: string;
  avatar_url: string;
  type: string;
}

interface NotionRepoOption {
  name: string;
  isValid: boolean;
  hasIssues?: boolean;
  canCreateIssues?: boolean;
  canEditIssues?: boolean;
  url?: string;
  description?: string;
  error?: string;
  id?: number;
  permission?: string;
  private?: boolean;
  owner?: {
    login: string;
    avatar_url: string;
  };
}

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
  const [tokenScopes, setTokenScopes] = useState<string | null>(null);
  const [notionRepoOptions, setNotionRepoOptions] = useState<
    NotionRepoOption[]
  >([]);
  const [validatingRepos, setValidatingRepos] = useState<string | null>(null);

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

    try {
      const response = await fetch("/api/config/validate-github-token");
      const data = await response.json();
      setValidationResult(data);

      if (data.success && data.details) {
        setGithubUser(data.details.user || null);
        setTokenScopes(data.details.token_scopes || null);
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

    try {
      const response = await fetch(
        `/api/config/validate-notion-repos?database_id=${databaseId}`
      );
      const data = await response.json();

      if (data.success && data.details && data.details.repositories) {
        setNotionRepoOptions(data.details.repositories);
        if (data.details.token_scopes) {
          setTokenScopes(data.details.token_scopes);
        }
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
            <CardTitle className="text-3xl font-bold">
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
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                    <span className="font-medium">
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
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                    <span className="font-medium">
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
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                    <span className="font-medium">
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
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <AlertTitle>
                    {validationResult.success ? "驗證成功" : "驗證失敗"}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  <p className="mb-2">{validationResult.message}</p>
                  {validationResult.details && (
                    <Card className="mt-4 bg-muted/50">
                      <CardContent className="p-4">
                        <pre className="text-xs overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(validationResult.details, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {validationResult && validationResult.success && notionUser && (
              <Card className="overflow-hidden border-blue-500 shadow-md">
                <div className="h-1 bg-blue-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Notion 用戶信息</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      驗證成功
                    </Badge>
                  </div>
                  <CardDescription>
                    整合已成功連接到您的 Notion 帳戶
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      {notionUser.avatar_url ? (
                        <img
                          src={notionUser.avatar_url}
                          alt={notionUser.name || "Notion User"}
                          className="w-12 h-12 rounded-full border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg border-2 border-blue-200">
                          {(notionUser.name || "N").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-lg">
                          {notionUser.name || "Notion 用戶"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {notionUser.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {notionUser.type === "person" ? "個人用戶" : "機器人"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          Notion API
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      <Card
                        key={db.id}
                        className="overflow-hidden border-green-500"
                      >
                        <div className="h-1 bg-green-500"></div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">
                              {db.title || "未命名資料庫"}
                            </h3>
                            <Badge
                              variant="outline"
                              className="ml-2 bg-green-50"
                            >
                              符合要求
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            ID: {db.id}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Link
                              href={db.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <span>在 Notion 中查看</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => validateNotionRepos(db.id)}
                              disabled={validatingRepos === db.id}
                            >
                              {validatingRepos === db.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary mr-1"></div>
                                  驗證儲存庫選項中...
                                </>
                              ) : (
                                "驗證儲存庫選項"
                              )}
                            </Button>
                          </div>

                          {notionRepoOptions.length > 0 &&
                            validatingRepos === null &&
                            db.id === validDatabases[0].id && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="font-medium mb-2">
                                  儲存庫選項驗證結果
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {notionRepoOptions.map((repo) => (
                                    <div
                                      key={repo.name}
                                      className={`p-3 rounded-md ${
                                        repo.isValid
                                          ? "bg-green-50 border border-green-200"
                                          : "bg-red-50 border border-red-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {repo.name}
                                          </span>
                                        </div>
                                        <div className="flex gap-2">
                                          <Badge
                                            variant="outline"
                                            className={`${
                                              repo.isValid
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                            }`}
                                          >
                                            {repo.isValid ? "有效" : "無效"}
                                          </Badge>
                                        </div>
                                      </div>

                                      {repo.isValid ? (
                                        <div className="mt-2 text-sm">
                                          {repo.description && (
                                            <p className="text-muted-foreground mb-1">
                                              {repo.description}
                                            </p>
                                          )}
                                          <div className="flex flex-wrap items-center gap-2 mt-1">
                                            {repo.hasIssues &&
                                              repo.canCreateIssues &&
                                              repo.canEditIssues && (
                                                <Badge
                                                  variant="outline"
                                                  className="bg-green-50 text-green-700"
                                                >
                                                  可操作 Issues
                                                </Badge>
                                              )}
                                            {repo.url && (
                                              <Link
                                                href={repo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline flex items-center gap-1"
                                              >
                                                <span>查看儲存庫</span>
                                                <ExternalLink className="w-3 h-3" />
                                              </Link>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <p className="text-sm text-red-600 mt-1">
                                            {repo.error}
                                          </p>
                                          {repo.url && (
                                            <Link
                                              href={repo.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                            >
                                              <span>在 GitHub 中查看</span>
                                              <ExternalLink className="w-3 h-3" />
                                            </Link>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </CardContent>
                      </Card>
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
                          <Card
                            key={db.id}
                            className="overflow-hidden border-yellow-500"
                          >
                            <div className="h-1 bg-yellow-500"></div>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">
                                  {db.title || "未命名資料庫"}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-yellow-50 text-yellow-700"
                                >
                                  需要修改
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                ID: {db.id}
                              </p>
                              {db.missingFields.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-sm font-medium text-red-500">
                                    缺少欄位：
                                  </p>
                                  <ul className="text-sm list-disc list-inside text-red-500">
                                    {db.missingFields.map((field) => (
                                      <li key={field.name}>
                                        {field.name} - {field.description}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {db.invalidTypes.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-sm font-medium text-orange-500">
                                    欄位類型不符：
                                  </p>
                                  <ul className="text-sm list-disc list-inside text-orange-500">
                                    {db.invalidTypes.map((type) => (
                                      <li key={type.name}>
                                        {type.name} (預期: {type.expected},
                                        實際: {type.actual})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <Link
                                href={db.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-2"
                              >
                                <span>在 Notion 中查看</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {validationResult && validationResult.success && githubUser && (
              <Card className="overflow-hidden border-gray-500 shadow-md">
                <div className="h-1 bg-gray-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>GitHub 用戶信息</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      驗證成功
                    </Badge>
                  </div>
                  <CardDescription>
                    整合已成功連接到您的 GitHub 帳戶
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50/30 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={githubUser.avatar_url}
                        alt={githubUser.login}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <h3 className="font-medium text-lg">
                          {githubUser.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{githubUser.login}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>文檔與資源</CardTitle>
                <CardDescription>有用的連結和參考資料</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResourceLink
                    href="https://github.com/yourusername/web_hook_server"
                    title="GitHub 儲存庫"
                    icon="github"
                  />
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

function StatusCard({
  title,
  status,
  description,
}: {
  title: string;
  status: boolean;
  description: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${status ? "bg-green-500" : "bg-red-500"}`}></div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant={status ? "default" : "destructive"} className="ml-2">
            {status ? "已配置" : "未配置"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ResourceLink({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: string;
}) {
  const getIcon = () => {
    switch (icon) {
      case "github":
        return (
          <img
            src="https://github.com/favicon.ico"
            alt="GitHub"
            className="w-5 h-5"
          />
        );
      case "notion":
        return (
          <img
            src="https://www.notion.so/images/favicon.ico"
            alt="Notion"
            className="w-5 h-5"
          />
        );
      case "vercel":
        return (
          <img
            src="https://vercel.com/favicon.ico"
            alt="Vercel"
            className="w-5 h-5"
          />
        );
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          {getIcon()}
          <span className="font-medium">{title}</span>
          <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
